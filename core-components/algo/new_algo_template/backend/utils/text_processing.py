from email.parser import Parser
import re
import string
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')

def extract(text):
    """Extract information from email text"""
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