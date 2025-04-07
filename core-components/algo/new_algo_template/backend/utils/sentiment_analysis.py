import re
import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Initialize model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
sentiment_classifier = AutoModelForSequenceClassification.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")

def sentiment_classification(df):
    """Sentiment analysis"""
    date = df.get('time')
    raw_text = df.get('masked_text').tolist()
    clean_text = [re.sub(r'[\r\n]+', '', raw) for raw in raw_text]
    sentiment_df = pd.DataFrame({'date': date.tolist(), 'text': clean_text})
    sentiment_scores = []
    sentiment_labels = []

    for email_body in sentiment_df['text']:
        tokens = tokenizer(email_body, padding=True, truncation=True, return_tensors="pt")
        with torch.no_grad():
            outputs = sentiment_classifier(**tokens)
        
        # dim=1 -> normalize along the row (probability for each class)
        score = outputs.logits.softmax(dim=1)
        # dim=0 -> average the score for each class
        sentiment_score = score.mean(dim=0)
        sentiment_label = sentiment_score.argmax().item()
        
        sentiment_scores.append(sentiment_score.tolist())
        sentiment_labels.append(sentiment_label)

    sentiment_df['sentiment_score'] = sentiment_scores
    sentiment_df['sentiment_label'] = sentiment_labels
    
    return sentiment_df