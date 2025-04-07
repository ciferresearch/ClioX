#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import re
import json
import os
import requests
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
import torch
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS


from utils.text_processing import extract, nlp, cleansing
from utils.pii_detection import PII_detection_masking
from utils.sentiment_analysis import sentiment_classification


app = Flask(__name__)
CORS(app)  

os.makedirs('static/data', exist_ok=True)
os.makedirs('outputs', exist_ok=True)

@app.route('/api/analyze', methods=['POST'])
def analyze_data():
    try:
        file_path = request.json.get('file_path', '../../data/inputs/enron/enron_subset.csv')
        df = pd.read_csv(file_path)
        email_data = df["message"].apply(extract)
        df = df.join(pd.DataFrame(email_data.tolist()))
        
        analyzer, anonymizer, operator_config = initialize_nlp_engines()
        
        df['masked_text'] = df['email_body'].apply(lambda text: PII_detection_masking(text, analyzer, anonymizer, operator_config))
        df['clean_text'] = df['masked_text'].apply(cleansing)
        df['time'] = df['date'].str[:-12].apply(lambda x: datetime.strptime(x, '%a, %d %b %Y %H:%M:%S'))
        df.to_csv('outputs/enron_cleaned.csv', index=False)
        
        generate_date_distribution_plots(df)
    
        sentiment_df = sentiment_classification(df)
        generate_sentiment_json(sentiment_df)
        
        all_email = ' '.join(df['clean_text'].astype(str))
        
        data = {
            'inputFormat': 'text',
            'input': all_email
        }
        
        res = requests.post('http://localhost:8888', data=data)
        match = re.search(r'corpus=([a-f0-9]+)', res.url)
        corpus = match.group(1) if match else None
        
        return jsonify({
            'status': 'success',
            'message': 'Analysis completed successfully',
            'corpus': corpus
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/data/sentiment', methods=['GET'])
def get_sentiment_data():
    try:
        with open('static/data/sentiment_converted.json', 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/images/date_distribution', methods=['GET'])
def get_date_distribution():
    return send_file('outputs/date_distribution.png')

@app.route('/api/images/email_per_day', methods=['GET'])
def get_email_per_day():
    return send_file('outputs/email_per_day_distribution.png')

def initialize_nlp_engines():
    from presidio_analyzer import AnalyzerEngine
    from presidio_analyzer.nlp_engine import NlpEngineProvider
    from presidio_anonymizer import AnonymizerEngine
    from presidio_anonymizer.entities import OperatorConfig
    
    configuration = {
        "nlp_engine_name": "spacy",
        "models": [{"lang_code": 'en', "model_name": "en_core_web_sm"}],
    }
    provider = NlpEngineProvider(nlp_configuration=configuration)
    nlp_engine = provider.create_engine()
    analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=['en'])
    
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
    
    return analyzer, anonymizer, operator_config

def generate_date_distribution_plots(df):
    date_counts = df['time'].dt.date.value_counts().sort_index()

    plt.figure(figsize=(12, 6))
    plt.scatter(date_counts.index, date_counts.values, color='b', alpha=0.6)
    plt.xlabel('Date')
    plt.ylabel('Count')
    plt.title('Email Date Distribution')
    plt.xticks(rotation=45)
    plt.savefig('outputs/date_distribution.png')
    plt.close()
    
    plt.figure(figsize=(10, 6))
    sns.histplot(date_counts.values, bins=50, kde=True, color="purple")
    plt.xlabel("Emails Per Day")
    plt.ylabel("Frequency")
    plt.title("Distribution of Emails Per Day")
    plt.savefig('outputs/email_per_day_distribution.png')
    plt.close()

def generate_sentiment_json(sentiment_df):

    aggregate_df = sentiment_df.groupby('date')['sentiment_label'].value_counts().unstack().fillna(0).astype(int)
    aggregate_df['total'] = aggregate_df.sum(axis=1)
    aggregate_df['mean'] = aggregate_df.drop(columns='total').mean(axis=1)
    
    plot_df = aggregate_df.copy()
    plot_df = plot_df.reset_index()
    plot_df["date"] = pd.to_datetime(plot_df["date"], errors="coerce")
    
    # delte rows with NaT in 'date' column
    plot_df = plot_df.dropna(subset=["date"])
    
    # convert 'date' to date type
    plot_df["date"] = plot_df["date"].dt.date
    
    # group by 'date' and sum the values
    grouped = plot_df.groupby("date").sum().reset_index()
    
    output = []
    for col in grouped.columns[1:-2]:  # Skip 'date' and 'total' columns
        try:
            col_value = int(col)
            adjusted_value = col_value - 2
            name = f"+{adjusted_value}" if adjusted_value > 0 else str(adjusted_value)
        except ValueError:
            name = col  # Use the original column name if conversion fails
        
        output.append({
            "name": name,
            "values": [[day.strftime("%Y-%m-%dT00:00:00Z"), val] for day, val in zip(pd.to_datetime(grouped["date"]), grouped[col])]
        })
    
    # save JSON
    os.makedirs('static/data', exist_ok=True)
    with open("static/data/sentiment_converted.json", "w") as f:
        json.dump(output, f, indent=2)

if __name__ == "__main__":
    app.run(port=5001, debug=True)