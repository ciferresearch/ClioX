# Email Analysis API Documentation

## Overview
This API provides access to analyzed email data from the Enron dataset. The server processes all data on startup, and the endpoints serve pre-processed data to the frontend.

## Base URL
```
http://localhost:5001
```

## API Status

### Check Processing Status
```
GET /api/status
```

Returns the current status of data processing.

**Response**
```json
{
    "status": "ready" | "not_ready",
    "message": "Data processing complete" | "Data processing not complete"
}
```

## Data Endpoints

### Get Sentiment Analysis
```
GET /api/data/sentiment
```

Returns sentiment analysis data for emails over time.

**Response Format**
```json
[
    {
        "name": "-2",  // Very negative
        "values": [
            ["2000-01-01T00:00:00Z", 10],  // [timestamp, count]
            // ... more date-count pairs
        ]
    },
    {
        "name": "-1",  // Negative
        "values": [/* ... */]
    },
    {
        "name": "0",   // Neutral
        "values": [/* ... */]
    },
    {
        "name": "+1",  // Positive
        "values": [/* ... */]
    },
    {
        "name": "+2",  // Very positive
        "values": [/* ... */]
    }
]
```

### Get Date Distribution
```
GET /api/distribution/date
```

Returns CSV data showing email distribution over time.

**Response Format**
```csv
time,count
2000-01-01,150
2000-01-02,200
...
```

### Get Email Distribution
```
GET /api/distribution/email
```

Returns CSV data showing the number of emails per day.

**Response Format**
```csv
emails_per_day
150
200
...
```

### Get Word Cloud Data
```
GET /api/wordcloud
```

Returns word frequency data for generating a word cloud.

**Response Format**
```json
{
    "wordCloudData": [
        {
            "value": "word",
            "count": 100
        },
        // ... more word-count pairs
    ]
}
```

## Error Handling

### Common Error Responses

1. Data Not Ready
```json
{
    "status": "error",
    "message": "Data not yet processed"
}
```
Status Code: 503

2. Server Error
```json
{
    "status": "error",
    "message": "Error description"
}
```
Status Code: 500

## Implementation Guide

### Recommended Implementation Flow

1. On frontend initialization:
   ```javascript
   async function checkDataStatus() {
     const response = await fetch('/api/status');
     const data = await response.json();
     return data.status === 'ready';
   }
   ```

2. Wait for data to be ready:
   ```javascript
   async function waitForData() {
     while (!(await checkDataStatus())) {
       await new Promise(resolve => setTimeout(resolve, 1000));
     }
     // Data is ready, load visualizations
   }
   ```

3. Load data for visualizations:
   ```javascript
   async function loadVisualizations() {
     const [sentiment, wordcloud] = await Promise.all([
       fetch('/api/data/sentiment').then(r => r.json()),
       fetch('/api/wordcloud').then(r => r.json())
     ]);
     // Update UI with data
   }
   ```

### CSV Data Handling

For endpoints returning CSV data:
```javascript
async function getDistributionData() {
  const response = await fetch('/api/distribution/date');
  const csvText = await response.text();
  // Parse CSV using your preferred method
  // Example using d3:
  // const data = d3.csvParse(csvText);
}
```

### Error Handling Example

```javascript
async function fetchData(endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 503) {
        // Data not ready, retry later
        return null;
      }
      throw new Error(error.message);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}
```