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

@app.route('/api/analyze', methods=['POST', 'GET'])
def analyze_data(force_reprocess=False):
    """Process data and perform analysis"""
    try:
        # Check if all data files already exist
        if not force_reprocess:
            files_exist = {
                'cleaned_data': os.path.exists('outputs/enron_cleaned.csv'),
                'sentiment_data': os.path.exists('static/data/sentiment_converted.json'),
                'date_distribution': os.path.exists('static/data/date_distribution_data.csv'),
                'email_distribution': os.path.exists('static/data/email_per_day_distribution_data.csv'),
                'wordcloud': os.path.exists('static/data/temp/processed_wordcloud.json')
            }

            # If all files exist, we can skip processing
            if all(files_exist.values()):
                print("All data files already exist. Skipping processing.")
                return jsonify({
                    'status': 'success',
                    'message': 'Data already processed. Using existing files.'
                })

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

        # Generate date distribution data
        generate_date_distribution_data(df)

        # Sentiment analysis
        sentiment_df = sentiment_classification(df)

        # Generate sentiment analysis JSON
        generate_sentiment_json(sentiment_df)

        # Data processing complete

        return jsonify({
            'status': 'success',
            'message': 'Analysis completed successfully'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Check if data has been processed"""
    try:
        # Check if all required files exist
        files_exist = {
            'cleaned_data': os.path.exists('outputs/enron_cleaned.csv'),
            'sentiment_data': os.path.exists('static/data/sentiment_converted.json'),
            'date_distribution': os.path.exists('static/data/date_distribution_data.csv'),
            'email_distribution': os.path.exists('static/data/email_per_day_distribution_data.csv'),
            'wordcloud': os.path.exists('static/data/temp/processed_wordcloud.json')
        }

        print("Status check - files_exist:", files_exist)

        # Check if all files exist
        all_processed = all(files_exist.values())

        # Check individual component status
        component_status = {
            'date_distribution': files_exist['date_distribution'],
            'email_distribution': files_exist['email_distribution'],
            'sentiment_chart': files_exist['sentiment_data'],
            'wordcloud': files_exist['wordcloud'],
            'document_summary': files_exist['cleaned_data'],
            'cleaned_data': files_exist['cleaned_data']
        }

        print("Status check - component_status:", component_status)

        return jsonify({
            'status': 'ready' if all_processed else 'not_ready',
            'files': files_exist,
            'components': component_status
        })
    except Exception as e:
        print(f"Error in status API: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/process', methods=['GET'])
def trigger_processing():
    """Trigger data processing"""
    try:
        # Check if force reprocessing is requested
        force_reprocess = request.args.get('force', 'false').lower() == 'true'

        # Call the analyze_data function
        result = analyze_data(force_reprocess=force_reprocess)
        return result
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/data/sentiment', methods=['GET'])
def get_sentiment_data():
    """Get sentiment analysis data"""
    try:
        # Check if sentiment data exists
        if not os.path.exists('static/data/sentiment_converted.json'):
            # Check if cleaned data exists
            if os.path.exists('outputs/enron_cleaned.csv'):
                # We have cleaned data but no sentiment data, just generate sentiment
                df = pd.read_csv('outputs/enron_cleaned.csv')
                sentiment_df = sentiment_classification(df)
                generate_sentiment_json(sentiment_df)
            else:
                # Need to process everything
                analyze_data()

        # Now try to read the file
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
    try:
        # Check if we have processed data already
        if os.path.exists('static/data/date_distribution_data.csv'):
            with open('static/data/date_distribution_data.csv', 'r') as f:
                csv_data = f.read()
            return csv_data, 200, {'Content-Type': 'text/csv'}

        # If not, check if we have cleaned data
        if os.path.exists('outputs/enron_cleaned.csv'):
            # We have cleaned data but no date distribution, just generate it
            df = pd.read_csv('outputs/enron_cleaned.csv')
            # Convert time column to datetime if it's not already
            if df['time'].dtype == 'object':
                df['time'] = pd.to_datetime(df['time'], errors='coerce')

            # Generate date distribution data
            date_counts = df['time'].dt.date.value_counts().reset_index()
            date_counts.columns = ['time', 'count']
            date_counts = date_counts.sort_values('time')

            # Save to CSV
            os.makedirs('static/data', exist_ok=True)
            date_counts.to_csv('static/data/date_distribution_data.csv', index=False)

            with open('static/data/date_distribution_data.csv', 'r') as f:
                csv_data = f.read()
            return csv_data, 200, {'Content-Type': 'text/csv'}
        else:
            # Need to process everything
            analyze_data()

            # Check if file was created
            if os.path.exists('static/data/date_distribution_data.csv'):
                with open('static/data/date_distribution_data.csv', 'r') as f:
                    csv_data = f.read()
                return csv_data, 200, {'Content-Type': 'text/csv'}

        return jsonify({
            'status': 'error',
            'message': 'No data available. Please run analysis first.'
        }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/distribution/email', methods=['GET'])
def get_email_distribution_data():
    """Get email count distribution data in CSV format"""
    try:
        # Check if we have processed data already
        if os.path.exists('static/data/email_per_day_distribution_data.csv'):
            with open('static/data/email_per_day_distribution_data.csv', 'r') as f:
                csv_data = f.read()
            return csv_data, 200, {'Content-Type': 'text/csv'}

        # If not, check if we have cleaned data
        if os.path.exists('outputs/enron_cleaned.csv'):
            # We have cleaned data but no email distribution, just generate it
            df = pd.read_csv('outputs/enron_cleaned.csv')
            # Convert time column to datetime if it's not already
            if df['time'].dtype == 'object':
                df['time'] = pd.to_datetime(df['time'], errors='coerce')

            # Group by date and count emails per day
            date_counts = df.groupby(df['time'].dt.date).size().reset_index(name='emails_per_day')

            # Save to CSV
            os.makedirs('static/data', exist_ok=True)
            # Make sure we have both time and emails_per_day columns
            if 'time' not in date_counts.columns:
                date_counts = date_counts.reset_index()
                date_counts.columns = ['time', 'emails_per_day']
            date_counts.to_csv('static/data/email_per_day_distribution_data.csv', index=False)

            with open('static/data/email_per_day_distribution_data.csv', 'r') as f:
                csv_data = f.read()
            return csv_data, 200, {'Content-Type': 'text/csv'}
        else:
            # Need to process everything
            analyze_data()

            # Check if file was created
            if os.path.exists('static/data/email_per_day_distribution_data.csv'):
                with open('static/data/email_per_day_distribution_data.csv', 'r') as f:
                    csv_data = f.read()
                return csv_data, 200, {'Content-Type': 'text/csv'}

        return jsonify({
            'status': 'error',
            'message': 'No data available. Please run analysis first.'
        }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/wordcloud', methods=['GET'])
def get_wordcloud_data():
    """Get word cloud data"""
    try:
        # Check if we have processed data already
        if os.path.exists('static/data/temp/processed_wordcloud.json'):
            with open('static/data/temp/processed_wordcloud.json', 'r') as f:
                data = json.load(f)
            return jsonify(data)

        # If not, check if we have cleaned data
        if os.path.exists('outputs/enron_cleaned.csv'):
            # We have cleaned data but no wordcloud, just generate it
            df = pd.read_csv('outputs/enron_cleaned.csv')

            # Combine all cleaned text
            all_text = ' '.join(df['clean_text'].dropna().astype(str))

            # Split into words
            words = all_text.split()

            # Count word frequencies
            word_counts = Counter(words)

            # Get the most common words
            min_count = int(request.args.get('min_count', 5))
            limit = int(request.args.get('limit', 100))

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

            return jsonify(output_data)
        else:
            # Need to process everything
            analyze_data()

            # Check if file was created
            if os.path.exists('static/data/temp/processed_wordcloud.json'):
                with open('static/data/temp/processed_wordcloud.json', 'r') as f:
                    data = json.load(f)
                return jsonify(data)

        return jsonify({
            'status': 'error',
            'message': 'No data available. Please run analysis first.'
        }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/document/summary', methods=['GET'])
def get_document_summary():
    """Get document summary"""
    try:
        print("Document summary API called")
        # Check if we have cleaned data
        if not os.path.exists('outputs/enron_cleaned.csv'):
            print("Error: No cleaned data file found at outputs/enron_cleaned.csv")
            return jsonify({
                'status': 'error',
                'message': 'No data available. Please run analysis first.'
            }), 404

        # Read the cleaned data
        df = pd.read_csv('outputs/enron_cleaned.csv')
        print(f"Loaded cleaned data with {len(df)} rows")
        
        # Calculate statistics
        total_documents = len(df)
        total_words = df['clean_text'].str.split().str.len().sum()
        all_words = ' '.join(df['clean_text'].dropna()).split()
        unique_words = len(set(all_words))
        vocabulary_density = unique_words / total_words if total_words > 0 else 0
        
        # Calculate readability (simple implementation)
        total_sentences = df['clean_text'].str.count('[.!?]+').sum()
        words_per_sentence = total_words / total_sentences if total_sentences > 0 else 0
        avg_word_length = sum(len(word) for word in all_words) / len(all_words) if all_words else 0
        readability_index = 0.4 * (words_per_sentence + 100 * (len([w for w in all_words if len(w) > 6]) / total_words))
        
        # Get frequent words
        word_counts = Counter(all_words).most_common(5)
        frequent_words = [{"word": word, "count": count} for word, count in word_counts]
        
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
        
        print("Successfully generated document summary stats")
        return jsonify(stats)
    except Exception as e:
        print(f"Error in document summary API: {str(e)}")
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
        os.makedirs('static/data/temp', exist_ok=True)
        with open('static/data/temp/processed_wordcloud.json', 'w') as f:
            json.dump(output_data, f, indent=2)

        print(f"Successfully generated word cloud data. Found {len(most_common)} words with frequency >= {min_count}")
    except Exception as e:
        print(f"Error generating word cloud data: {str(e)}")

if __name__ == "__main__":
    app.run(port=5001, debug=False)