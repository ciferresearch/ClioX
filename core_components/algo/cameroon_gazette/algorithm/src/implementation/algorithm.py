from logging import getLogger
from pathlib import Path
from typing import Any, Optional, TypeVar
from oceanprotocol_job_details.ocean import JobDetails

import pandas as pd
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
import re
import json
import string
from datetime import datetime
from tqdm import tqdm
from collections import Counter
from multiprocessing import Pool, cpu_count
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

T = TypeVar("T")
logger = getLogger(__name__)


class Algorithm:
    tokenizer = None
    sentiment_classifier = None
    device = None

    def __init__(self, job_details: JobDetails):
        self._job_details = job_details
        self.results = {}
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")

    def _validate_input(self) -> None:
        if not self._job_details.files:
            logger.warning("No files found")
            raise ValueError("No files found")


    def cleansing(self, text):
        """Clean and tokenize text"""
        if not isinstance(text, str):
            return ''
            
        # Remove HTML tags
        clean = re.compile('<.*?>')
        text = re.sub(clean, '', text)
        wrd_tokens = word_tokenize(text.lower())

        # Remove stopwords & punctuation
        stopwords = set(nltk.corpus.stopwords.words('english'))
        filtered_wrds_token = [word for word in wrd_tokens if word.isalnum() and word not in stopwords and word not in string.punctuation]
        
        return ' '.join(filtered_wrds_token)


    # def sentiment_classication(self, df):
    #     if Algorithm.tokenizer is None:
    #         Algorithm.tokenizer = AutoTokenizer.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
    #         Algorithm.sentiment_classifier = AutoModelForSequenceClassification.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
    #         Algorithm.sentiment_classifier = Algorithm.sentiment_classifier.to(self.device)
    #         Algorithm.sentiment_classifier.eval()

    #     # Get the text data and clean it
    #     raw_text = df.get('content').tolist()
        
    #     sentiment_Scores = []
    #     sentiment_labels = []
        
    #     batch_size = 4   
        
    #     for i in tqdm(range(0, len(raw_text), batch_size), desc="Processing sentiment"):
    #         batch_texts = raw_text[i:i+batch_size]
            
    #         # Tokenize batch with smaller max_length
    #         tokens = Algorithm.tokenizer(
    #             batch_texts, 
    #             padding=True, 
    #             truncation=True, 
    #             max_length=256,  
    #             return_tensors="pt"
    #         )
            
    #         # Move tokens to the same device as the model
    #         tokens = {k: v.to(self.device) for k, v in tokens.items()}
            
    #         with torch.no_grad():
    #             outputs = Algorithm.sentiment_classifier(**tokens)
            
    #         scores = outputs.logits.softmax(dim=1)
    #         # Move scores back to CPU for numpy conversion
    #         batch_scores = scores.cpu().numpy().tolist()
    #         batch_labels = scores.argmax(dim=1).cpu().numpy().tolist()
            
    #         sentiment_Scores.extend(batch_scores)
    #         sentiment_labels.extend(batch_labels)
            
    #         del tokens, outputs, scores
    #         torch.cuda.empty_cache() if torch.cuda.is_available() else None
        
    #     df['sentiment_score'] = sentiment_Scores
    #     df['sentiment_label'] = sentiment_labels
        
    #     sentiment_df = df[['time', 'content', 'sentiment_score', 'sentiment_label']].copy()
    #     sentiment_df.rename(columns={'time': 'date'}, inplace=True)
        
    #     return sentiment_df


    def process_chunk(self, chunk):
        # Process each chunk
        chunk['clean_text'] = chunk['content'].apply(self.cleansing)
        return chunk

    def _process_wrapper(self, chunk):
        """A wrapper to call self.process_chunk from multiprocessing"""
        return self.process_chunk(chunk)

    def parallel_process_dataframe(self, df, chunk_size=1000):
        # Split dataframe into chunks
        chunks = [df.iloc[i:i + chunk_size] for i in range(0, len(df), chunk_size)]
        
        # Process chunks in parallel
        with Pool(processes=cpu_count()) as pool:
            processed_chunks = pool.map(self._process_wrapper, chunks)
        
        # Combine processed chunks using concat
        return pd.concat(processed_chunks, ignore_index=True)
    
    def run(self) -> "Algorithm":
        # Initialize results dictionary
        self.results = {
            'sentiment': [],
            'date_distribution': None,
            'email_distribution': None,
            'wordcloud': {},
            'document_summary': {}
        }

        self._validate_input()

        input_files = self._job_details.files.files[0].input_files
        filename = str(input_files[0])
    
        # Read JSON file
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Extract dates and content from Decrees
        decree_data = []
        for decree in data.get('Decrees', []):
            decree_date = decree.get('Date')
            for article in decree.get('Articles', []):
                decree_data.append({
                    'date': decree_date,
                    'content': article.get('Content_EN', '')
                })

        # Create DataFrame
        df = pd.DataFrame(decree_data)
        
        if df.empty:
            logger.warning("No data found in the input file")
            return self

        # Process text data
        print('Processing text data...')
        df['clean_text'] = df['content'].apply(self.cleansing)
        
        # Date processing
        df['time'] = pd.to_datetime(df['date'], format='%d %B %Y')

        # =============== date distribution =============================================
        print('Processing date distribution...')
        date_counts = df['time'].dt.date.value_counts().sort_index()
        date_distribution_df = pd.DataFrame({
            'time': date_counts.index,
            'count': date_counts.values
        })
        self.results['date_distribution'] = date_distribution_df

        # =============== articles per day distribution =============================================
        print('Processing articles per day distribution...')
        articles_per_day = date_counts.value_counts()
        articles_distribution_df = pd.DataFrame({
            'emails_per_day': articles_per_day.values
        })
        self.results['email_distribution'] = articles_distribution_df

        # =============== sentiment analysis =============================================
        print('Starting sentiment analysis...')
        if Algorithm.tokenizer is None:
            Algorithm.tokenizer = AutoTokenizer.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
            Algorithm.sentiment_classifier = AutoModelForSequenceClassification.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
            Algorithm.sentiment_classifier = Algorithm.sentiment_classifier.to(self.device)
            Algorithm.sentiment_classifier.eval()

        raw_text = df['content'].tolist()
        sentiment_scores = []
        sentiment_labels = []
        sentiment_words = []
        
        batch_size = 4   
        
        for i in tqdm(range(0, len(raw_text), batch_size), desc="Processing sentiment"):
            batch_texts = raw_text[i:i+batch_size]
            
            tokens = Algorithm.tokenizer(
                batch_texts, 
                padding=True, 
                truncation=True, 
                max_length=256,  
                return_tensors="pt"
            )
            
            tokens = {k: v.to(self.device) for k, v in tokens.items()}
            
            with torch.no_grad():
                outputs = Algorithm.sentiment_classifier(**tokens, output_attentions=True)
            
            scores = outputs.logits.softmax(dim=1)
            batch_scores = scores.cpu().numpy().tolist()
            batch_labels = scores.argmax(dim=1).cpu().numpy().tolist()

            # Process attention for each text in the batch
            batch_words = []
            attention = outputs.attentions[-1].mean(dim=1)  # Average across attention heads
            
            for batch_idx in range(len(batch_texts)):
                # Get attention for this specific text
                cls_attention = attention[batch_idx, 0, 1:].cpu().detach().numpy()  # Skip [CLS] token
                input_tokens = Algorithm.tokenizer.convert_ids_to_tokens(tokens['input_ids'][batch_idx])

                # Find tokens with highest attention scores (excluding [CLS], [SEP], [PAD])    
                token_attention_pairs = [(token, attn) for token, attn in zip(input_tokens[1:], cls_attention)
                                        if token not in ['[CLS]', '[SEP]', '[PAD]','.', ',', '!', '?', ';', ':', '"', "'", '(', ')', '[', ']', '{', '}', '-', '_', '=', '+', '*', '/', '\\', '|', '&', '%', '$', '#', '@', '~', '`', '^', '<', '>']]
                    
                # If there are no valid tokens, use a fallback
                if not token_attention_pairs:
                    batch_words.append("")
                else:
                    # Sort by attention score and take top 3
                    sorted_tokens = sorted(token_attention_pairs, key=lambda x: x[1], reverse=True)
                    top_tokens = [token for token, _ in sorted_tokens[:3]]
                    batch_words.append(", ".join(top_tokens))
            
            sentiment_scores.extend(batch_scores)
            sentiment_labels.extend(batch_labels)
            sentiment_words.extend(batch_words)
            
            del tokens, outputs, scores, attention
            torch.cuda.empty_cache() if torch.cuda.is_available() else None

        df['sentiment_score'] = sentiment_scores
        df['sentiment_label'] = sentiment_labels
        df['contribute_words'] = sentiment_words

        # Group by date for sentiment analysis
        sentiment_by_date = df.groupby(df['time'].dt.date)['sentiment_label'].agg([
            ('1', lambda x: sum(x == 0)),  # Very negative
            ('2', lambda x: sum(x == 1)),  # Negative
            ('3', lambda x: sum(x == 2)),  # Neutral
            ('4', lambda x: sum(x == 3)),  # Positive
            ('5', lambda x: sum(x == 4))   # Very positive
        ]).reset_index()

        sentiment_by_date['total'] = sentiment_by_date[['1', '2', '3', '4', '5']].sum(axis=1)
        sentiment_by_date['mean'] = (
            sentiment_by_date['1'] * 1 + 
            sentiment_by_date['2'] * 2 + 
            sentiment_by_date['3'] * 3 + 
            sentiment_by_date['4'] * 4 + 
            sentiment_by_date['5'] * 5
        ) / sentiment_by_date['total']

        # Convert to required JSON format
        sentiment_output = []
        for col in ['1', '2', '3', '4', '5']:
            adjusted_value = int(col) - 3
            name = f"+{adjusted_value}" if adjusted_value > 0 else str(adjusted_value)
            
            # Get sentiment label for this category
            sentiment_label = int(col) - 1  # Convert to 0-4 range
            
            # Group by date and get words for each date
            sentiment_by_date_with_words = []
            for day in sentiment_by_date['time']:
                day_texts = df[(df['sentiment_label'] == sentiment_label) & 
                              (df['time'].dt.date == day)]['contribute_words'].tolist()
                
                # Flatten and collect all words for this date
                all_words = []
                for text in day_texts:
                    if text and text != "error_processing":
                        words = [word.strip() for word in text.split(',') if word.strip()]
                        all_words.extend(words)
                
                # Get the count for this sentiment on this date
                count = sentiment_by_date[sentiment_by_date['time'] == day][col].iloc[0]
                
                sentiment_by_date_with_words.append([
                    day.strftime("%Y-%m-%dT00:00:00Z"),
                    int(count),
                    all_words
                ])
            
            sentiment_output.append({
                "name": name,
                "values": sentiment_by_date_with_words
            })

        self.results['sentiment'] = sentiment_output

        # =============== wordcloud data ======================================================
        print('Processing wordcloud data...')
        all_text = ' '.join(df['clean_text'].dropna().astype(str))
        words = all_text.split()
        word_counts = Counter(words)

        most_common = [
            {"value": word, "count": int(count)}
            for word, count in word_counts.most_common(700)
            if count >= 1
        ]

        self.results['wordcloud'] = {"wordCloudData": most_common}

        # =============== document summary data =============================================
        print('Processing document summary data...')
        total_documents = int(len(df))
        total_words = int(df['clean_text'].str.split().str.len().sum())
        all_words = ' '.join(df['clean_text'].dropna()).split()
        unique_words = int(len(set(all_words)))
        vocabulary_density = float(unique_words / total_words if total_words > 0 else 0)
        
        total_sentences = int(len(sent_tokenize(all_text)))
        words_per_sentence = float(total_words / total_sentences if total_sentences > 0 else 0)
        readability_index = float(0.4 * (words_per_sentence + 100 * (len([w for w in all_words if len(w) > 6]) / total_words)))
        
        frequent_words = [
            {"word": word, "count": int(count)} 
            for word, count in Counter(all_words).most_common(5)
        ]
        
        self.results['document_summary'] = {
            "totalDocuments": total_documents,
            "totalWords": total_words,
            "uniqueWords": unique_words,
            "vocabularyDensity": vocabulary_density,
            "readabilityIndex": readability_index,
            "wordsPerSentence": words_per_sentence,
            "frequentWords": frequent_words,
            "created": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        return self

    
    def save_result(self, path: Path) -> None:
        wordcloud_path = path / "wordcloud.json"
        document_summary_path = path / "document_summary.json"
        email_distribution_path = path / "email_distribution.csv"
        date_distribution_path = path / "date_distribution.csv"
        sentiment_path = path / "sentiment.json"

        with open(wordcloud_path, "w", encoding="utf-8") as f:
            try:
                json.dump(self.results['wordcloud'], f, indent=2)
                logger.info(f"Saved wordcloud data to {wordcloud_path}")
            except Exception as e:
                logger.exception(f"Error saving wordcloud data: {e}")

        with open(document_summary_path, "w", encoding="utf-8") as f:
            try:
                json.dump(self.results['document_summary'], f, indent=2)
                logger.info(f"Saved document summary to {document_summary_path}")
            except Exception as e:
                logger.exception(f"Error saving document summary: {e}")

        with open(email_distribution_path, "w", encoding="utf-8") as f:
            try:
                self.results['email_distribution'].to_csv(f, index=False)
                logger.info(f"Saved email distribution to {email_distribution_path}")
            except Exception as e:
                logger.exception(f"Error saving email distribution: {e}")

        with open(date_distribution_path, "w", encoding="utf-8") as f:
            try:
                self.results['date_distribution'].to_csv(f, index=False)
                logger.info(f"Saved date distribution to {date_distribution_path}")
            except Exception as e:
                logger.exception(f"Error saving date distribution: {e}")
        
        with open(sentiment_path, "w", encoding="utf-8") as f:
            try:
                json.dump(self.results['sentiment'], f, indent=2)
                logger.info(f"Saved sentiment to {sentiment_path}")
            except Exception as e:
                logger.exception(f"Error saving sentiment: {e}")