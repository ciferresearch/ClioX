from __future__ import annotations

from typing import Any, Dict, List, Tuple

import pandas as pd


class SentimentService:
    """Facade for sentiment analysis pipeline.

    Minimal initial implementation that keeps current behavior:
    - Accept a dataframe that already contains `masked_text` and `time` columns
    - Returns a `sentiment_df` compatible with existing aggregation code
    - Returns an already-structured json-like list for `sentiment.json` if available
    
    This class is a seam to later introduce industrial features (sliding window,
    calibration, IG explanations, etc.) without touching the caller.
    """

    def __init__(self, classifier_fn):
        # classifier_fn: callable(df) -> pd.DataFrame with columns
        # ['time','masked_text','sentiment_score','sentiment_label','contribute_words']
        self._classifier_fn = classifier_fn

    def run(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
        sentiment_df = self._classifier_fn(df)
        # json structure is produced by the caller aggregation for now
        return sentiment_df, []


