from logging import getLogger
from pathlib import Path
from typing import Any, Optional, TypeVar
from oceanprotocol_job_details.ocean import JobDetails

import pandas as pd
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
import re
import json
from email.parser import Parser
import string
import os
from datetime import datetime
from tqdm import tqdm

from collections import Counter
from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig
from multiprocessing import Pool, cpu_count


import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification



T = TypeVar("T")

logger = getLogger(__name__)

_ResultType = Any


class Algorithm:
    # Add these class variables at the beginning of the Algorithm class
    tokenizer = None
    sentiment_classifier = None
    device = None

    def __init__(self, job_details: JobDetails):
        self._job_details = job_details
        self.results = {}  # Initialize as empty dictionary instead of None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")

    def _validate_input(self) -> None:
        if not self._job_details.files:
            logger.warning("No files found")
            raise ValueError("No files found")

    def extract(self, text):
        email = Parser().parsestr(text)
        
        return {
            "email_body": email.get_payload(),
            "sender": email["From"],
            "receiver": email["To"],
            "date": email["Date"],
            "subject": email["Subject"],
        }

    def cleansing(self, text):
        """Clean and tokenize text"""
        # Remove HTML tags
        clean = re.compile('<.*?>')
        text = re.sub(clean, '', text)
        wrd_tokens = word_tokenize(text.lower())

        # Remove stopwords & punctuation
        stopwords = set(nltk.corpus.stopwords.words('english'))
        filtered_wrds_token = [word for word in wrd_tokens if word.isalnum() and word not in stopwords and word not in string.punctuation]
        
        return ' '.join(filtered_wrds_token)


    def PII_detection_masking(self, text):
        # Cache the analyzer and anonymizer as static variables
        if not hasattr(Algorithm.PII_detection_masking, 'analyzer'):
            configuration = {
                "nlp_engine_name": "spacy",
                "models": [{"lang_code": 'en', "model_name": "en_core_web_sm"}],
            }
            provider = NlpEngineProvider(nlp_configuration=configuration)
            nlp_engine = provider.create_engine()
            Algorithm.PII_detection_masking.analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=['en'])
            Algorithm.PII_detection_masking.anonymizer = AnonymizerEngine()
            Algorithm.PII_detection_masking.operator_config = {
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
            results = Algorithm.PII_detection_masking.analyzer.analyze(text=chunk, language='en')
            masked_chunk = Algorithm.PII_detection_masking.anonymizer.anonymize(
                text=chunk, 
                analyzer_results=results,
                operators=Algorithm.PII_detection_masking.operator_config
            )
            masked_text.append(masked_chunk.text)

        return ' '.join(masked_text)


    ## sentiment analysis over date time aggregation  
    # def sentiment_classication(self, df):
    #     # Initialize models only once as class attributes
    #     if Algorithm.tokenizer is None:
    #         Algorithm.tokenizer = AutoTokenizer.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
    #         Algorithm.sentiment_classifier = AutoModelForSequenceClassification.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
    #         Algorithm.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    #         Algorithm.sentiment_classifier.to(Algorithm.device)
    #         Algorithm.sentiment_classifier.eval()  # Set model to evaluation mode

    #     # 0 - very negative
    #     # 1 - negative
    #     # 2 - neutral
    #     # 3 - positive
    #     # 4 - very positive

    #     # Get the text data and clean it
    #     raw_text = df.get('masked_text').tolist()
    #     clean_text = [re.sub(r'[\r\n]+', '', raw) for raw in raw_text]
        
    #     sentiment_Scores = []
    #     sentiment_labels = []
        
    #     # Process in batches
    #     batch_size = 16
    #     for i in range(0, len(clean_text), batch_size):
    #         batch_texts = clean_text[i:i+batch_size]
            
    #         # Tokenize batch
    #         tokens = Algorithm.tokenizer(batch_texts, padding=True, truncation=True, max_length=512, return_tensors="pt")
            
    #         # Move tokens to device
    #         tokens = {key: val.to(Algorithm.device) for key, val in tokens.items()}
            
    #         with torch.no_grad():
    #             outputs = Algorithm.sentiment_classifier(**tokens)
            
    #         # Get scores for each text in batch
    #         scores = outputs.logits.softmax(dim=1)
            
    #         # Process each item in the batch
    #         for score in scores:
    #             sentiment_score = score.cpu().numpy().tolist()  # Move back to CPU and convert to list
    #             sentiment_label = score.argmax().item()
                
    #             sentiment_Scores.append(sentiment_score)
    #             sentiment_labels.append(sentiment_label)
        
    #     # Add sentiment results directly to the original dataframe
    #     df['sentiment_score'] = sentiment_Scores
    #     df['sentiment_label'] = sentiment_labels
        
    #     # Create a new dataframe with only the needed columns for further processing
    #     sentiment_df = df[['time', 'masked_text', 'sentiment_score', 'sentiment_label']].copy()
    #     sentiment_df.rename(columns={'time': 'date'}, inplace=True)
        
    #     return sentiment_df


    def sentiment_classication(self, df):
        if Algorithm.tokenizer is None:
            Algorithm.tokenizer = AutoTokenizer.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
            Algorithm.sentiment_classifier = AutoModelForSequenceClassification.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
            Algorithm.sentiment_classifier = Algorithm.sentiment_classifier.to(self.device)
            Algorithm.sentiment_classifier.eval()

        # Get the text data and clean it
        raw_text = df.get('masked_text').tolist()
        
        sentiment_Scores = []
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
            
            sentiment_Scores.extend(batch_scores)
            sentiment_labels.extend(batch_labels)
            sentiment_words.extend(batch_words)
            
            del tokens, outputs, scores, attention
            torch.cuda.empty_cache() if torch.cuda.is_available() else None
        
        df['sentiment_score'] = sentiment_Scores
        df['sentiment_label'] = sentiment_labels
        df['contribute_words'] = sentiment_words
        
        sentiment_df = df[['time', 'masked_text', 'sentiment_score', 'sentiment_label', 'contribute_words']].copy()
        sentiment_df.rename(columns={'time': 'date'}, inplace=True)
        
        return sentiment_df


    def process_chunk(self, chunk):
        # Process each chunk
        chunk['masked_text'] = chunk['email_body'].apply(self.PII_detection_masking)
        chunk['clean_text'] = chunk['masked_text'].apply(self.cleansing)
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

        '''
        return files:
        1. date_distribution.csv
        2. document_summary.json
        3. email_distribution.csv
        4. sentiment.json
        5. wordcloud.json
        '''
        
        input_files = self._job_details.files.files[0].input_files
        filename = str(input_files[0])
    
        # =============== pre-process =============================================
        print('start pre processing data')
        # nltk.download('punkt_tab')
        # nltk.download('stopwords')
        # nltk.download('punkt')
        
        df = pd.read_csv(filename)
        email_data = df["message"].apply(self.extract)
        df = df.join(pd.DataFrame(email_data.tolist()))
        # print(df.head())

        # Process text data in parallel
        print('Processing text data in parallel...')
        df = self.parallel_process_dataframe(df)
        
        # Date processing (this is relatively fast, can stay as is)
        df['time'] = df['date'].str[:-12].apply(lambda x: datetime.strptime(x, '%a, %d %b %Y %H:%M:%S'))


        # =============== sentiment analysis =============================================
        print('start sentiment analysis data')
        # sentiment df [OUTPUT]
        sentiment_df = self.sentiment_classication(df)

        # Group by date for sentiment analysis
        sentiment_by_date = sentiment_df.groupby(sentiment_df['date'].dt.date)['sentiment_label'].agg([
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
            for day in sentiment_by_date['date']:
                day_texts = sentiment_df[(sentiment_df['sentiment_label'] == sentiment_label) & 
                                       (sentiment_df['date'].dt.date == day)]['contribute_words'].tolist()
                
                # Flatten and collect all words for this date
                all_words = []
                for text in day_texts:
                    if text and text != "error_processing":
                        words = [word.strip() for word in text.split(',') if word.strip()]
                        all_words.extend(words)
                
                # Get the count for this sentiment on this date
                count = sentiment_by_date[sentiment_by_date['date'] == day][col].iloc[0]
                
                sentiment_by_date_with_words.append([
                    day.strftime("%Y-%m-%dT00:00:00Z"),
                    int(count),
                    all_words
                ])
            
            sentiment_output.append({
                "name": name,
                "values": sentiment_by_date_with_words
            })

        # Save sentiment data to results dictionary
        self.results['sentiment'] = sentiment_output


        # =============== date distribution data =============================================
        print('start processing date distribution data')
        # Convert to date and counts
        date_counts = df['time'].dt.date.value_counts().sort_index()

        # Save date distribution data to CSV
        date_counts_df = date_counts.reset_index()
        date_counts_df.columns = ['time', 'count']
        
        # Save to results - store as CSV string directly
        self.results['date_distribution'] = date_counts_df
        
        # =============== email distribution data =============================================
        print('start processing email distribution data')

        emails_per_day_df = pd.DataFrame({'emails_per_day': date_counts.values})
        self.results['email_distribution'] = emails_per_day_df
        
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

        self.results['wordcloud'] = output_data


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

        self.results['document_summary'] = stats
            
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