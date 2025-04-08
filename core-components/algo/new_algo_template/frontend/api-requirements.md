# Backend API Requirements

This document outlines the API endpoints required for the frontend chart components.

## 1. Sentiment Chart API

**Endpoint:** `/api/sentiment`

**Method:** GET

**Description:** Returns sentiment data over time for different entities.

**Response Data Structure:**
```typescript
interface SentimentResponse {
  data: SentimentData[];
}

interface SentimentData {
  name: string;        // Name of the entity (person, topic, etc.)
  values: [string, number][];  // Array of [timestamp, sentiment_value] pairs
}
```

**Example:**
```json
{
  "data": [
    {
      "name": "Energy",
      "values": [
        ["2022-01-01T00:00:00Z", 0.75],
        ["2022-01-02T00:00:00Z", 0.82],
        ["2022-01-03T00:00:00Z", 0.65]
      ]
    },
    {
      "name": "Finance",
      "values": [
        ["2022-01-01T00:00:00Z", 0.45],
        ["2022-01-02T00:00:00Z", 0.53],
        ["2022-01-03T00:00:00Z", 0.48]
      ]
    }
  ]
}
```

## 2. Data Distribution API

### 2.1 Date Distribution Endpoint

**Endpoint:** `/api/distribution/date`

**Method:** GET

**Description:** Returns the count of documents/emails per date.

**Query Parameters:**
- `start_date` (optional): Filter data from this date (format: YYYY-MM-DD)
- `end_date` (optional): Filter data until this date (format: YYYY-MM-DD)

**Response Data Structure:**
```typescript
interface DateDistributionResponse {
  data: Array<{
    time: string;   // Date in YYYY-MM-DD format
    count: number;  // Number of documents/emails on this date
  }>;
}
```

**Example:**
```json
{
  "data": [
    {
      "time": "2022-01-01",
      "count": 45
    },
    {
      "time": "2022-01-02",
      "count": 32
    },
    {
      "time": "2022-01-03",
      "count": 67
    }
  ]
}
```

### 2.2 Email Per Day Distribution Endpoint

**Endpoint:** `/api/distribution/emails-per-day`

**Method:** GET

**Description:** Returns the distribution of emails per day.

**Response Data Structure:**
```typescript
interface EmailsPerDayResponse {
  data: Array<{
    emails_per_day: number;  // Number of emails per day
    count: number;           // Frequency (how many days had this many emails)
  }>;
}
```

**Example:**
```json
{
  "data": [
    {
      "emails_per_day": 0,
      "count": 12
    },
    {
      "emails_per_day": 1,
      "count": 25
    },
    {
      "emails_per_day": 2,
      "count": 18
    },
    {
      "emails_per_day": 3,
      "count": 10
    }
  ]
}
```

## 3. Document Summary API

**Endpoint:** `/api/document-stats`

**Method:** GET

**Description:** Returns statistical summary of the document corpus.

**Response Data Structure:**
```typescript
interface DocumentStatsResponse {
  totalDocuments: number;  // Total number of documents in corpus
  totalWords: number;      // Total word count
  uniqueWords: number;     // Number of unique words
  vocabularyDensity: number;  // Ratio of unique words to total words
  readabilityIndex: number;   // Readability score (e.g., Flesch-Kincaid)
  wordsPerSentence: number;   // Average words per sentence
  frequentWords: Array<{
    word: string;   // Word
    count: number;  // Frequency count
  }>;
  created: string;  // Timestamp of when the stats were generated
}
```

**Example:**
```json
{
  "totalDocuments": 1000,
  "totalWords": 55785,
  "uniqueWords": 5741,
  "vocabularyDensity": 0.103,
  "readabilityIndex": 18.678,
  "wordsPerSentence": 25.3,
  "frequentWords": [
    { "word": "ect", "count": 1387 },
    { "word": "enron", "count": 716 },
    { "word": "subject", "count": 436 },
    { "word": "forwarded", "count": 419 },
    { "word": "cc", "count": 419 }
  ],
  "created": "2023-04-07T15:30:45Z"
}
```

## 4. WordCloud API

**Endpoint:** `/api/wordcloud`

**Method:** GET

**Description:** Returns word frequency data for generating a word cloud visualization.

**Query Parameters:**
- `min_count` (optional): Minimum word frequency to include (default: 1)
- `limit` (optional): Maximum number of words to return (default: 100)

**Response Data Structure:**
```typescript
interface WordCloudResponse {
  wordCloudData: Array<{
    value: string;  // The word or phrase
    count: number;  // Frequency count
  }>;
}
```

**Example:**
```json
{
  "wordCloudData": [
    {
      "value": "gas",
      "count": 396
    },
    {
      "value": "power",
      "count": 280
    },
    {
      "value": "ees",
      "count": 228
    },
    {
      "value": "project",
      "count": 203
    },
    {
      "value": "meeting",
      "count": 200
    },
    {
      "value": "enronxgate",
      "count": 197
    },
    {
      "value": "loan",
      "count": 190
    },
    {
      "value": "market",
      "count": 178
    }
  ]
}
```

## Implementation Recommendations

1. **Error Handling**: All endpoints should return appropriate HTTP status codes and error messages.
   
2. **Caching**: Consider implementing caching for these endpoints, especially for the document statistics which may be computation-heavy.
   
3. **Pagination**: For large datasets, implement pagination on the date distribution endpoint.
   
4. **Filter Options**: Consider adding filter options to sentiment data by date range or specific entities.

5. **Data Format Versioning**: Include API version in the URL path or as a header to allow for future changes while maintaining backward compatibility. 