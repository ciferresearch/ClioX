#!/usr/bin/env python3
import json
import re
import string
from collections import Counter
import os

def clean_text(text):
    """Clean text by removing punctuation, numbers, and extra whitespace"""
    # Convert to lowercase
    text = text.lower()
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    # Remove numbers
    text = re.sub(r'\d+', '', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def remove_stopwords(words):
    """Remove common stopwords that aren't meaningful for visualization"""
    stopwords = set([
        'the', 'and', 'to', 'of', 'a', 'in', 'for', 'is', 'on', 'that', 'by',
        'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from',
        'at', 'as', 'your', 'have', 'was', 'an', 'will', 'can', 'all', 'get',
        'has', 'if', 'my', 'one', 'would', 'they', 'their', 'there', 'been',
        'me', 'we', 'who', 'what', 'when', 'where', 'which', 'how', 'he', 'she',
        'am', 'been', 'our', 'us', 'also', 'but', 'than', 'too', 'very',
        'just', 'so', 'any', 'some', 'such', 'no', 'nor', 'not', 'only',
        'same', 'than', 'up', 'down', 'out', 'off', 'over', 'under',
        'each', 'few', 'more', 'most', 'other', 'own', 'per', 'per',
        'send', 'sent', 'subject', 'forwarded', 'please', 'thank', 'thanks',
        'enron', 'ect', 'cc', 'email', 'mail', 'message', 'may', 'know',
        'see', 'let', 'day', 'make', 'like', 'new', 'going', 'good',
        'want', 'need', 'use', 'looking', 'time', 'come', 'take', 'could',
        'call', 'give', 'go', 'think', 'well', 'back', 'look', 'work',
        'now', 'way', 'even', 'help', 'still', 'around', 'got', 'said'
    ])
    return [word for word in words if word not in stopwords and len(word) > 2]

def process_file_to_wordcloud(input_file, output_file, min_count=5, max_words=150):
    """
    Process the input file into word frequency format for the wordcloud component
    
    Args:
        input_file: Path to the input file
        output_file: Path to save the processed JSON output
        min_count: Minimum frequency for a word to be included
        max_words: Maximum number of words to include
    """
    try:
        # Read the input file as text directly
        with open(input_file, 'r', encoding='utf-8') as f:
            text = f.read()
            
        # Extract meaningful text content 
        # The file appears to be a large text block that might start with JSON format but
        # contains a lot of email content
        
        # If it starts with JSON, try to extract and use that format
        try:
            json_data = json.loads(text)
            if 'inputFormat' in json_data and json_data.get('inputFormat') == 'text':
                # Use the 'text' field if it exists
                if 'text' in json_data:
                    text = json_data['text']
        except:
            # If JSON parsing fails, just use the raw text
            pass
        
        # Clean the text
        clean = clean_text(text)
        
        # Split into words
        words = clean.split()
        
        # Remove stopwords
        filtered_words = remove_stopwords(words)
        
        # Count word frequencies
        word_counts = Counter(filtered_words)
        
        # Get the most common words, filtered by minimum count
        most_common = [
            {"value": word, "count": count} 
            for word, count in word_counts.most_common(max_words) 
            if count >= min_count
        ]
        
        # Create the output structure
        output_data = {
            "wordCloudData": most_common
        }
        
        # Write to the output file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2)
            
        print(f"Successfully processed the data. Found {len(most_common)} words with frequency >= {min_count}")
        return True
        
    except Exception as e:
        print(f"Error processing file: {e}")
        return False

if __name__ == "__main__":
    # Get the current directory
    current_dir = os.path.dirname(os.path.realpath(__file__))
    # Go up one level to access the data directory
    data_dir = os.path.dirname(current_dir)
    
    input_file = os.path.join(data_dir, "server_input_data.json")
    output_file = os.path.join(current_dir, "processed_wordcloud.json")
    
    print(f"Processing {input_file}...")
    success = process_file_to_wordcloud(input_file, output_file)
    
    if success:
        print(f"Word cloud data saved to {output_file}")
    else:
        print("Failed to process the data") 