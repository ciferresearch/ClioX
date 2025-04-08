#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import re
import json
import os
import requests
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import Counter

# Import utility functions
from utils.text_processing import extract, cleansing
from utils.pii_detection import PII_detection_masking
from utils.sentiment_analysis import sentiment_classification

# Initialize Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS to allow cross-origin requests

# Create necessary directories
os.makedirs('static/data', exist_ok=True)
os.makedirs('static/data/temp', exist_ok=True)
os.makedirs('outputs', exist_ok=True)

# Global variable to track data processing status
data_processed = False

def process_data():
    """
    Process the Enron dataset on server startup.
    This function handles all data processing tasks including:
    - Loading and cleaning email data
    - PII detection and masking
    - Sentiment analysis
    - Generating distribution data
    - Creating word cloud data
    """
    global data_processed
    try:
        # Use the enron_subset.csv file in the backend/data directory
        file_path = 'data/enron_subset.csv'

        # Read CSV file
        print(f"Reading data from {file_path}")
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
        try:
            df['time'] = df['date'].str[:-12].apply(lambda x: datetime.strptime(x, '%a, %d %b %Y %H:%M:%S'))
        except Exception as date_error:
            print(f"Error parsing dates: {date_error}")
            # Try alternative date format
            df['time'] = pd.to_datetime(df['date'], errors='coerce')

        # Save cleaned data
        df.to_csv('outputs/enron_cleaned.csv', index=False)

        # Generate all required data
        generate_date_distribution_data(df)
        sentiment_df = sentiment_classification(df)
        generate_sentiment_json(sentiment_df)

        data_processed = True
        print("Data processing completed successfully")
        return True
    except Exception as e:
        print(f"Error processing data: {str(e)}")
        return False

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get the current status of data processing"""
    return jsonify({
        'status': 'ready' if data_processed else 'not_ready',
        'message': 'Data processing complete' if data_processed else 'Data processing not complete'
    })

@app.route('/api/data/sentiment', methods=['GET'])
def get_sentiment_data():
    """Get sentiment analysis data"""
    if not data_processed:
        return jsonify({
            'status': 'error',
            'message': 'Data not yet processed'
        }), 503

    try:
        with open('static/data/sentiment_converted.json', 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/distribution/date', methods=['GET'])
def get_date_distribution_data():
    """Get date distribution data in CSV format"""
    if not data_processed:
        return jsonify({
            'status': 'error',
            'message': 'Data not yet processed'
        }), 503

    try:
        with open('static/data/date_distribution_data.csv', 'r') as f:
            csv_data = f.read()
        return csv_data, 200, {'Content-Type': 'text/csv'}
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/distribution/email', methods=['GET'])
def get_email_distribution_data():
    """Get email count distribution data in CSV format"""
    if not data_processed:
        return jsonify({
            'status': 'error',
            'message': 'Data not yet processed'
        }), 503

    try:
        with open('static/data/email_per_day_distribution_data.csv', 'r') as f:
            csv_data = f.read()
        return csv_data, 200, {'Content-Type': 'text/csv'}
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/wordcloud', methods=['GET'])
def get_wordcloud_data():
    """Get word cloud data"""
    if not data_processed:
        return jsonify({
            'status': 'error',
            'message': 'Data not yet processed'
        }), 503

    try:
        with open('static/data/temp/processed_wordcloud.json', 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

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

def generate_date_distribution_data(df):
    """Generate date distribution CSV files"""
    # Convert to date and counts
    date_counts = df['time'].dt.date.value_counts().sort_index()

    # Save date distribution data to CSV
    date_counts_df = date_counts.reset_index()
    date_counts_df.columns = ['time', 'count']
    os.makedirs('static/data', exist_ok=True)
    date_counts_df.to_csv('static/data/date_distribution_data.csv', index=False)

    # Save email per day data to CSV
    emails_per_day_df = pd.DataFrame({'emails_per_day': date_counts.values})
    emails_per_day_df.to_csv('static/data/email_per_day_distribution_data.csv', index=False)

    # Generate word cloud data
    generate_wordcloud_data(df)

def generate_sentiment_json(sentiment_df):
    """Generate sentiment analysis JSON"""
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

def generate_wordcloud_data(df):
    """Generate word cloud data"""
    try:
        # Combine all cleaned text
        all_text = ' '.join(df['clean_text'].dropna().astype(str))

        # Split into words
        words = all_text.split()

        # Count word frequencies
        word_counts = Counter(words)

        # Get the most common words
        min_count = 5
        limit = 100

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
        os.makedirs('static/data/temp', exist_ok=True)
        with open('static/data/temp/processed_wordcloud.json', 'w') as f:
            json.dump(output_data, f, indent=2)

        print(f"Successfully generated word cloud data. Found {len(most_common)} words with frequency >= {min_count}")
    except Exception as e:
        print(f"Error generating word cloud data: {str(e)}")

if __name__ == "__main__":
    # Process data on startup
    print("Starting data processing...")
    process_data()
    
    # Start the Flask server
    app.run(port=5001, debug=False)