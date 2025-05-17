#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
import re
import json
from email.parser import Parser
import string
import os
from datetime import datetime
import torch
from collections import Counter
from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from multiprocessing import Pool, cpu_count


def extract(text):
    email = Parser().parsestr(text)
    
    return {
        "email_body": email.get_payload(),
        "sender": email["From"],
        "receiver": email["To"],
        "date": email["Date"],
        "subject": email["Subject"],
    }

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


def PII_detection_masking(text):
    # Cache the analyzer and anonymizer as static variables
    if not hasattr(PII_detection_masking, 'analyzer'):
        configuration = {
            "nlp_engine_name": "spacy",
            "models": [{"lang_code": 'en', "model_name": "en_core_web_sm"}],
        }
        provider = NlpEngineProvider(nlp_configuration=configuration)
        nlp_engine = provider.create_engine()
        PII_detection_masking.analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=['en'])
        PII_detection_masking.anonymizer = AnonymizerEngine()
        PII_detection_masking.operator_config = {
            "PERSON": OperatorConfig("replace", {"new_value": "<PERSON>"}),
            "LOCATION": OperatorConfig("replace", {"new_value": "<LOCATION>"}),
            "DATE_TIME": OperatorConfig("replace", {"new_value": "<DATE_TIME>"}),
            "ORGANIZATION": OperatorConfig("replace", {"new_value": "<ORGANIZATION>"}),
            "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "<PHONE_NUMBER>"}),
            "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": "<EMAIL_ADDRESS>"}),
            "CREDIT_CARD": OperatorConfig("replace", {"new_value": "<CREDIT_CARD>"}),
        }

    # Process larger chunks of text
    chunk_size = 50000  # Increased chunk size
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
    masked_text = []
    
    for chunk in chunks:
        results = PII_detection_masking.analyzer.analyze(text=chunk, language='en')
        masked_chunk = PII_detection_masking.anonymizer.anonymize(
            text=chunk, 
            analyzer_results=results,
            operators=PII_detection_masking.operator_config
        )
        masked_text.append(masked_chunk.text)

    return ' '.join(masked_text)


### sentiment analysis over date time aggregation  
def sentiment_classication(df):
    # tokenizer and classifier download for sentiment analysis 
    # model capable for English, Dutch, German, French, Italian, Spanish  
    tokenizer = AutoTokenizer.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
    sentiment_classifier = AutoModelForSequenceClassification.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")

    # 0 - very negative
    # 1 - negative
    # 2 - neutral
    # 3 - positive
    # 4 - very positive

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

def get_job_details():
    root = os.getenv('ROOT_FOLDER', '')
    """Reads in metadata information about assets used by the algo"""

    job = dict()
    job['dids'] = json.loads(os.getenv('DIDS', None))
    job['metadata'] = dict()
    job['files'] = dict()
    job['algo'] = dict()
    job['secret'] = os.getenv('secret', None)
    algo_did = os.getenv('TRANSFORMATION_DID', None)
    if job['dids'] is not None:
        for did in job['dids']:
            job['files'][did] = list()
            # Just one file for DID with name "0"
            job['files'][did].append(root + '/data/inputs/' + did + '/0')
    if algo_did is not None:
        job['algo']['did'] = algo_did
        job['algo']['ddo_path'] = root + '/data/ddos/' + algo_did
    return job

def text_analysis(job_details):
    '''
    return files:
    1. date_distribution.csv
    2. document_summary.json
    3. email_distribution.csv
    4. sentiment.json
    5. wordcloud.json
    '''

    root = os.getenv('ROOT_FOLDER', '')

    print('Starting compute job with the following input information:')
    print(json.dumps(job_details, sort_keys=True, indent=4))

    first_did = job_details['dids'][0]
    filename = job_details['files'][first_did][0]

    with open(filename, 'r', encoding='utf-8') as infp:
        df = infp.read()


    # only use the first 12 rows for testing
    df = df[:12]

    import traceback
    try:
        # =============== pre-process =============================================
        print('Start pre-processing data')
        
        # Check if dataframe is empty
        if df.empty:
            raise ValueError("Input dataframe is empty")
            
        # Check if required column exists
        if "message" not in df.columns:
            raise KeyError("Required column 'message' not found in dataframe")
        
        try:
            # Extract email data
            email_data = df["message"].apply(extract)
            print('Email data extraction completed')
        except Exception as e:
            raise RuntimeError(f"Failed to extract email data: {str(e)}")
            
        try:
            # Join extracted data with original dataframe
            df = df.join(pd.DataFrame(email_data.tolist()))
            print('Data joining completed')
        except Exception as e:
            raise RuntimeError(f"Failed to join dataframes: {str(e)}")
        
        try:
            # Process text data in parallel
            print('Processing text data in parallel...')
            df = parallel_process_dataframe(df)
            print('Parallel processing completed')
        except Exception as e:
            raise RuntimeError(f"Parallel processing failed: {str(e)}")
        
        try:
            # Date processing
            if 'date' not in df.columns:
                raise KeyError("Required column 'date' not found for date processing")
                
            df['time'] = df['date'].str[:-12].apply(
                lambda x: datetime.strptime(x, '%a, %d %b %Y %H:%M:%S')
            )
            print('Date processing completed')
        except ValueError as e:
            raise ValueError(f"Date parsing error: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Date processing failed: {str(e)}")
            
        return df
        
    except KeyError as e:
        print(f"ERROR: {str(e)}")
        traceback.print_exc()
        raise
    except ValueError as e:
        print(f"ERROR: {str(e)}")
        traceback.print_exc()
        raise
    except RuntimeError as e:
        print(f"ERROR: {str(e)}")
        traceback.print_exc()
        raise
    except Exception as e:
        print(f"Unexpected error during pre-processing: {str(e)}")
        traceback.print_exc()
        raise



    # =============== pre-process =============================================
    print('start pre processing data')
    email_data = df["message"].apply(extract)
    df = df.join(pd.DataFrame(email_data.tolist()))
    
    # Process text data in parallel
    print('Processing text data in parallel...')
    df = parallel_process_dataframe(df)
    
    # Date processing (this is relatively fast, can stay as is)
    df['time'] = df['date'].str[:-12].apply(lambda x: datetime.strptime(x, '%a, %d %b %Y %H:%M:%S'))

    # =============== sentiment analysis =============================================
    print('start sentiment analysis data')
    # sentiment df [OUTPUT]
    sentiment_df = sentiment_classication(df)

    # # aggregate sentiment label by date
    # aggregate_df = sentiment_df.groupby('date')['sentiment_label'].value_counts().unstack().fillna(0).astype(int)
    # aggregate_df['total'] = aggregate_df.sum(axis=1)
    # aggregate_df['mean'] = aggregate_df.drop(columns='total').mean(axis=1)

    # # Assuming aggregate_df is your DataFrame containing the sentiment data
    # plot_df = aggregate_df.copy()
    
    # plot_df = plot_df.reset_index()
    # plot_df["date"] = pd.to_datetime(plot_df["date"], errors="coerce")  # Coerce invalid values to NaT

    # # Drop any row where date conversion failed
    # plot_df = plot_df.dropna(subset=["date"])

    # # Convert dates to day-level granularity (YYYY-MM-DD)
    # plot_df["date"] = plot_df["date"].dt.date

    # # Group by day and sum values
    # grouped = plot_df.groupby("date").sum().reset_index()

    # # Convert to required JSON format
    # output = []
    # for col in grouped.columns[1:-2]:  # Exclude 'total' and 'mean'
    #     try:
    #         col_value = int(col)
    #         adjusted_value = col_value - 2
    #         print(f"Converting {col} to {adjusted_value}")
    #         name = f"+{adjusted_value}" if adjusted_value > 0 else str(adjusted_value)
    #     except ValueError:
    #         name = col  # Keep original name if conversion fails
        
    #     output.append({
    #         "name": name,
    #         "values": [[day.strftime("%Y-%m-%dT00:00:00Z"), val] for day, val in zip(pd.to_datetime(grouped["date"]), grouped[col])]
    #     })

    # Group by date
    sentiment_df['date'] = pd.to_datetime(sentiment_df['date']).dt.date

    # Create a pivot table with sentiment scores
    grouped = pd.pivot_table(
        sentiment_df,
        index='date',
        values='sentiment_label',
        aggfunc={
            'sentiment_label': [
                lambda x: sum(x == 0),  # Very negative (1 star)
                lambda x: sum(x == 1),  # Negative (2 stars)
                lambda x: sum(x == 2),  # Neutral (3 stars)
                lambda x: sum(x == 3),  # Positive (4 stars)
                lambda x: sum(x == 4),  # Very positive (5 stars)
            ]
        }
    ).reset_index()

    # Rename columns
    grouped.columns = ['date', '1', '2', '3', '4', '5']

    # Add total and mean columns
    grouped['total'] = grouped['1'] + grouped['2'] + grouped['3'] + grouped['4'] + grouped['5']
    grouped['mean'] = (grouped['1']*1 + grouped['2']*2 + grouped['3']*3 + grouped['4']*4 + grouped['5']*5) / grouped['total']

    # Convert to required JSON format
    output = []
    for col in grouped.columns[1:-2]:  # Exclude 'total' and 'mean'
        try:
            col_value = int(col)
            # Map 1-5 column names to -2 to +2 sentiment scale
            adjusted_value = col_value - 3
            name = f"+{adjusted_value}" if adjusted_value > 0 else str(adjusted_value)
        except ValueError:
            print(f"Error converting column {col} to sentiment scale")
            name = col  # Keep original name if conversion fails

        output.append({
            "name": name,
            "values": [[day.strftime("%Y-%m-%dT00:00:00Z"), val] for day, val in zip(pd.to_datetime(grouped["date"]), grouped[col])]
        })

    # Save JSON
    with open(root+"/data/outputs/sentiment_converted.json", "w") as f:
        json.dump(output, f, indent=2)

    # =============== date distribution data =============================================
    print('start processing date distribution data')
    # Convert to date and counts
    date_counts = df['time'].dt.date.value_counts().sort_index()

    # Save date distribution data to CSV
    date_counts_df = date_counts.reset_index()
    date_counts_df.columns = ['time', 'count']
    
    # save csv
    date_counts_df.to_csv(root + '/data/outputs/date_distribution_data.csv', index=False)
    
    # =============== email distribution data =============================================
    print('start processing email distribution data')

    emails_per_day_df = pd.DataFrame({'emails_per_day': date_counts.values})
    emails_per_day_df.to_csv(root + '/data/outputs/email_per_day_distribution_data.csv', index=False)

    # =============== wordcloud data ======================================================
    print('start processing wordcloud data')

    # Combine all cleaned text
    all_text = ' '.join(df['clean_text'].dropna().astype(str))

    # Split into words
    words = all_text.split()

    # Count word frequencies
    word_counts = Counter(words)

    # Get the most common words
    min_count = 1
    limit = 700

    most_common = [
        {"value": word, "count": count}
        for word, count in word_counts.most_common(limit)
        if count >= min_count
    ]

    # Create the output structure
    output_data = {
        "wordCloudData": most_common
    }

    # Save to JSON
    with open(root + '/data/outputs/processed_wordcloud.json', 'w') as f:
        json.dump(output_data, f, indent=2)


    # =============== document summary data =============================================
    print('start processing document summary data')

    total_documents = int(len(df))  # Convert to Python int
    total_words = int(df['clean_text'].str.split().str.len().sum())  # Convert to Python int
    all_words = ' '.join(df['clean_text'].dropna()).split()
    unique_words = int(len(set(all_words)))  # Convert to Python int
    vocabulary_density = float(unique_words / total_words if total_words > 0 else 0)  # Convert to Python float
    
    all_text = ' '.join(df['clean_text'].dropna().astype(str))
    total_sentences = int(len(sent_tokenize(all_text)))  # Convert to Python int
    words_per_sentence = float(total_words / total_sentences if total_sentences > 0 else 0)  # Convert to Python float
    readability_index = float(0.4 * (words_per_sentence + 100 * (len([w for w in all_words if len(w) > 6]) / total_words)))  # Convert to Python float
    
    # Get frequent words
    word_counts = Counter(all_words).most_common(5)
    frequent_words = [{"word": word, "count": int(count)} for word, count in word_counts]  # Convert count to Python int
    
    stats = {
        "totalDocuments": total_documents,
        "totalWords": total_words,
        "uniqueWords": unique_words,
        "vocabularyDensity": vocabulary_density,
        "readabilityIndex": readability_index,
        "wordsPerSentence": words_per_sentence,
        "frequentWords": frequent_words,
        "created": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    with open(root + '/data/outputs/document_summary.json', 'w') as f:
        json.dump(stats, f, indent=2)

def process_chunk(chunk):
    # Process each chunk
    chunk['masked_text'] = chunk['email_body'].apply(PII_detection_masking)
    chunk['clean_text'] = chunk['masked_text'].apply(cleansing)
    return chunk

def parallel_process_dataframe(df, chunk_size=1000):
    # Split dataframe into chunks
    chunks = [df.iloc[i:i + chunk_size] for i in range(0, len(df), chunk_size)]
    
    # Process chunks in parallel
    with Pool(processes=cpu_count()) as pool:
        processed_chunks = pool.map(process_chunk, chunks)
    
    # Combine processed chunks using concat
    return pd.concat(processed_chunks, ignore_index=True)

if __name__ == "__main__":
    text_analysis(get_job_details())
    print("done whole analysis")

    