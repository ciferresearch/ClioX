#!/usr/bin/env python
# coding: utf-8

import pandas as pd
from collections import Counter
from nltk.tokenize import word_tokenize, sent_tokenize
import re
from wordcloud import WordCloud
import json
import urllib.parse
import webbrowser
from email.parser import Parser
import string
import matplotlib.pyplot as plt
import tempfile
import os
import requests
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
import torch
import numpy as np

from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from flask import Flask, render_template

# Download required NLTK data
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('punkt_tab')


def extract(text):
    email = Parser().parsestr(text)
    
    return {
        "email_body": email.get_payload(),
        "sender": email["From"],
        "receiver": email["To"],
        "date": email["Date"],
        "subject": email["Subject"],
    }


def nlp(text):
    """Clean and tokenize text"""
    # Remove HTML tags
    clean = re.compile('<.*?>')
    text = re.sub(clean, '', text)

    # Split into words and sentences
    sen_tokens = sent_tokenize(text)
    wrd_tokens = word_tokenize(text.lower())

    # Remove stopwords & punctuation
    stopwords = set(nltk.corpus.stopwords.words('english'))
    filtered_wrds_token = [word for word in wrd_tokens if word.isalnum() and word not in stopwords and word not in string.punctuation]
    
    return filtered_wrds_token, sen_tokens, ' '.join(filtered_wrds_token)



def cleansing(text):
    """Clean and tokenize text"""
    # Remove HTML tags
    clean = re.compile('<.*?>')
    text = re.sub(clean, '', text)
    wrd_tokens = word_tokenize(text.lower())

    # Remove stopwords & punctuation
    stopwords = set(nltk.corpus.stopwords.words('english'))
    filtered_wrds_token = [word for word in wrd_tokens if word.isalnum() and word not in stopwords and word not in string.punctuation]
    
    return ' '.join(filtered_wrds_token)


def PII_detection_masking(text):
    # do the analyze and masking 
    chunk_size = 10000
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
    masked_text = []
    for chunk in chunks:
        results = analyzer.analyze(text=chunk, language='en')
        masked_chunk = anonymizer.anonymize(text=chunk, analyzer_results=results,operators=operator_config)
        masked_text.append(masked_chunk.text)

    return ' '.join(masked_text)


### sentiment analysis over date time aggregation  
def sentiment_classication(df):
    date = df.get('time')
    raw_text = df.get('masked_text').tolist()
    clean_text = [re.sub(r'[\r\n]+', '', raw) for raw in raw_text]
    sentiment_df = pd.DataFrame({'date': date.tolist() , 'text' : clean_text})
    sentiment_Scores = []
    sentiment_labels = []

    
    for email_body in sentiment_df['text']:
        tokens = tokenizer(email_body, padding=True, truncation=True, return_tensors="pt")
        with torch.no_grad():
            outputs = sentiment_classifier(**tokens)
        
        # dim = 1 -> regulate along the row (prob for each class) 
        score = outputs.logits.softmax(dim=1)
        # dim = 0 -> average the score for each class
        sentiment_score = score.mean(dim=0)
        sentiment_label = sentiment_score.argmax().item()
        
        sentiment_Scores.append(sentiment_score.tolist())
        sentiment_labels.append(sentiment_label)

    sentiment_df['sentiment_score'] = sentiment_Scores
    sentiment_df['sentiment_label'] = sentiment_labels
    
    return sentiment_df


if __name__ == "__main__":
    file_path = '../../data/inputs/enron/enron_subset.csv'
    df = pd.read_csv(file_path)

    email_data = df["message"].apply(extract)
    df = df.join(pd.DataFrame(email_data.tolist()))

    # analyse engine
    configuration = {
    "nlp_engine_name": "spacy",
    "models": [{"lang_code": 'en', "model_name": "en_core_web_sm"}],
    }
    provider = NlpEngineProvider(nlp_configuration=configuration)
    nlp_engine = provider.create_engine()
    analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=['en'])

    # mask engine
    anonymizer = AnonymizerEngine()
    operator_config = {
        "PERSON": OperatorConfig("replace", {"new_value": "<PERSON>"}),
        "LOCATION": OperatorConfig("replace", {"new_value": "<LOCATION>"}),
        "DATE_TIME": OperatorConfig("replace", {"new_value": "<DATE_TIME>"}),
        "ORGANIZATION": OperatorConfig("replace", {"new_value": "<ORGANIZATION>"}),
        "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "<PHONE_NUMBER>"}),
        "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": "<EMAIL_ADDRESS>"}),
        "CREDIT_CARD": OperatorConfig("replace", {"new_value": "<CREDIT_CARD>"}),
    }

    # masking
    df['masked_text'] = df['email_body'].apply(PII_detection_masking)
    # cleasing
    df['clean_text'] = df['masked_text'].apply(cleansing)
    # date cleasing
    df['time'] = df['date'].str[:-12].apply(lambda x: datetime.strptime(x, '%a, %d %b %Y %H:%M:%S'))

    # save data 
    df.to_csv('outputs/enron_cleaned.csv', index=False)


    ## local analysis
    # convert to date and counts
    date_counts = df['time'].dt.date.value_counts().sort_index()  

    plt.figure(figsize=(12, 6))
    plt.scatter(date_counts.index, date_counts.values, color='b', alpha=0.6)
    plt.xlabel('Date')
    plt.ylabel('Count')
    plt.title('Email Date Distribution')
    plt.xticks(rotation=45) 
    plt.savefig('outputs/date_distribution')
    plt.show()
    plt.close()

    plt.figure(figsize=(10, 6))
    sns.histplot(date_counts.values, bins=50, kde=True, color="purple")

    plt.xlabel("Emails Per Day")
    plt.ylabel("Frequency")
    plt.title("Distribution of Emails Per Day")
    plt.savefig('outputs/email_per_day_distribution')
    plt.show()
    plt.close()

    # tokenizer and classifier download for sentiment analysis 
    # model capable for English, Dutch, German, French, Italian, Spanish  
    tokenizer = AutoTokenizer.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
    sentiment_classifier = AutoModelForSequenceClassification.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")

    # 0 - very negative
    # 1 - negative
    # 2 - neutral
    # 3 - positive
    # 4 - very positive

    sentiment_df = sentiment_classication(df)

    # aggregate sentiment label by date
    aggregate_df = sentiment_df.groupby('date')['sentiment_label'].value_counts().unstack().fillna(0).astype(int)
    aggregate_df['total'] = aggregate_df.sum(axis=1)
    aggregate_df['mean'] = aggregate_df.drop(columns='total').mean(axis=1)

    # Assuming aggregate_df is your DataFrame containing the sentiment data
    # skip first line for better visualization
    plot_df = aggregate_df[1:]
    
    plot_df = plot_df.reset_index()
    plot_df["date"] = pd.to_datetime(plot_df["date"], errors="coerce")  # Coerce invalid values to NaT

    # Drop any row where date conversion failed
    plot_df = plot_df.dropna(subset=["date"])

    # Convert dates to day-level granularity (YYYY-MM-DD)
    plot_df["date"] = plot_df["date"].dt.date

    # Group by day and sum values
    grouped = plot_df.groupby("date").sum().reset_index()

    # Convert to required JSON format
    output = []
    for col in grouped.columns[1:-2]:  # Exclude 'total' and 'mean'
        try:
            col_value = int(col)
            adjusted_value = col_value - 2
            print(f"Converting {col} to {adjusted_value}")
            name = f"+{adjusted_value}" if adjusted_value > 0 else str(adjusted_value)
        except ValueError:
            name = col  # Keep original name if conversion fails
        
        output.append({
            "name": name,
            "values": [[day.strftime("%Y-%m-%dT00:00:00Z"), val] for day, val in zip(pd.to_datetime(grouped["date"]), grouped[col])]
        })

    # Save JSON
    with open("static/data/sentiment_converted.json", "w") as f:
        json.dump(output, f, indent=2)

    # pack data for voyant server
    all_email = ' '.join(df['clean_text'].astype(str))

    data = {
    'inputFormat': 'text',
    'input': all_email
}
    res = requests.post('http://localhost:8888',data)

    match = re.search(r'corpus=([a-f0-9]+)', res.url)
    corpus = match.group(1)

    app = Flask(__name__)

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "outputs")

    @app.route("/")
    def index():
        return render_template("index.html", corpus = corpus)

    app.run(port=5001, debug=False)

    


