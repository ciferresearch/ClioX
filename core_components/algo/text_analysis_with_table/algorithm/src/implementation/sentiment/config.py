from dataclasses import dataclass


@dataclass
class SentimentConfig:
    max_length: int = 256
    window_overlap: int = 64
    top_k_words: int = 3
    confidence_threshold: float = 0.6


