def PII_detection_masking(text, analyzer, anonymizer, operator_config):
    """Perform PII detection and masking"""
    # Analyze and mask
    chunk_size = 10000
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
    masked_text = []
    for chunk in chunks:
        results = analyzer.analyze(text=chunk, language='en')
        masked_chunk = anonymizer.anonymize(text=chunk, analyzer_results=results, operators=operator_config)
        masked_text.append(masked_chunk.text)

    return ' '.join(masked_text)