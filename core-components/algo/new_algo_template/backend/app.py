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

# Import utility functions
from utils.text_processing import extract, nlp, cleansing
from utils.pii_detection import PII_detection_masking
from utils.sentiment_analysis import sentiment_classification

# Initialize Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS to allow cross-origin requests

# Create necessary directories
os.makedirs('static/data', exist_ok=True)
os.makedirs('outputs', exist_ok=True)

@app.route('/api/analyze', methods=['POST'])
def analyze_data():
    """Process data and perform analysis"""
    try:
        file_path = request.json.get('file_path', '../../data/inputs/enron/enron_subset.csv')
        
        # Read CSV file
        df = pd.read_csv(file_path)
        
        # Extract email content
        email_data = df["message"].apply(extract)
        df = df.join(pd.DataFrame(email_data.tolist()))
        
        # Initialize NLP analysis and PII detection engines
        analyzer, anonymizer, operator_config = initialize_nlp_engines()
        
        # Mask PII information
        df['masked_text'] = df['email_body'].apply(lambda text: PII_detection_masking(text, analyzer, anonymizer, operator_config))
        
        # Clean text
        df['clean_text'] = df['masked_text'].apply(cleansing)
        
        # Clean date
        df['time'] = df['date'].str[:-12].apply(lambda x: datetime.strptime(x, '%a, %d %b %Y %H:%M:%S'))
        
        # Save cleaned data
        df.to_csv('outputs/enron_cleaned.csv', index=False)
        
        # Generate date distribution plots
        generate_date_distribution_plots(df)
        
        # Sentiment analysis
        sentiment_df = sentiment_classification(df)
        
        # Generate sentiment analysis JSON
        generate_sentiment_json(sentiment_df)
        
        # Prepare data for Voyant server
        all_email = ' '.join(df['clean_text'].astype(str))
        
        data = {
            'inputFormat': 'text',
            'input': all_email
        }
        
        # Send to Voyant server
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
    """Get sentiment analysis data"""
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
    """Get date distribution image"""
    return send_file('outputs/date_distribution.png')

@app.route('/api/images/email_per_day', methods=['GET'])
def get_email_per_day():
    """Get daily email count distribution image"""
    return send_file('outputs/email_per_day_distribution.png')

def initialize_nlp_engines():
    """Initialize NLP engine and PII detection"""
    from presidio_analyzer import AnalyzerEngine
    from presidio_analyzer.nlp_engine import NlpEngineProvider
    from presidio_anonymizer import AnonymizerEngine
    from presidio_anonymizer.entities import OperatorConfig
    
    # Analysis engine configuration
    configuration = {
        "nlp_engine_name": "spacy",
        "models": [{"lang_code": 'en', "model_name": "en_core_web_sm"}],
    }
    provider = NlpEngineProvider(nlp_configuration=configuration)
    nlp_engine = provider.create_engine()
    analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=['en'])
    
    # Masking engine
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
    """Generate date distribution plots"""
    # Convert to date and counts
    date_counts = df['time'].dt.date.value_counts().sort_index()
    
    # Create date distribution scatter plot
    plt.figure(figsize=(12, 6))
    plt.scatter(date_counts.index, date_counts.values, color='b', alpha=0.6)
    plt.xlabel('Date')
    plt.ylabel('Count')
    plt.title('Email Date Distribution')
    plt.xticks(rotation=45)
    plt.savefig('outputs/date_distribution.png')
    plt.close()
    
    # Create daily email count distribution plot
    plt.figure(figsize=(10, 6))
    sns.histplot(date_counts.values, bins=50, kde=True, color="purple")
    plt.xlabel("Emails Per Day")
    plt.ylabel("Frequency")
    plt.title("Distribution of Emails Per Day")
    plt.savefig('outputs/email_per_day_distribution.png')
    plt.close()

def generate_sentiment_json(sentiment_df):
    """Generate sentiment analysis JSON"""
    # Aggregate sentiment labels by date
    aggregate_df = sentiment_df.groupby('date')['sentiment_label'].value_counts().unstack().fillna(0).astype(int)
    aggregate_df['total'] = aggregate_df.sum(axis=1)
    aggregate_df['mean'] = aggregate_df.drop(columns='total').mean(axis=1)
    
    # Skip first line for better visualization
    plot_df = aggregate_df[1:]
    plot_df = plot_df.reset_index()
    plot_df["date"] = pd.to_datetime(plot_df["date"], errors="coerce")
    
    # Drop rows where date conversion failed
    plot_df = plot_df.dropna(subset=["date"])
    
    # Convert to day-level granularity
    plot_df["date"] = plot_df["date"].dt.date
    
    # Group by day and sum values
    grouped = plot_df.groupby("date").sum().reset_index()
    
    # Convert to required JSON format
    output = []
    for col in grouped.columns[1:-2]:  # Exclude 'total' and 'mean'
        try:
            col_value = int(col)
            adjusted_value = col_value - 2
            name = f"+{adjusted_value}" if adjusted_value > 0 else str(adjusted_value)
        except ValueError:
            name = col  # Keep original name if conversion fails
        
        output.append({
            "name": name,
            "values": [[day.strftime("%Y-%m-%dT00:00:00Z"), val] for day, val in zip(pd.to_datetime(grouped["date"]), grouped[col])]
        })
    
    # Save JSON
    os.makedirs('static/data', exist_ok=True)
    with open("static/data/sentiment_converted.json", "w") as f:
        json.dump(output, f, indent=2)

if __name__ == "__main__":
    app.run(port=5001, debug=True)