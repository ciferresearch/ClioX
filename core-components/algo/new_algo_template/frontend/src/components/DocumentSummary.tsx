'use client';

import { useEffect, useState, useCallback } from 'react';
import ChartError from './ChartError';

interface DocumentSummary {
  totalDocuments: number;
  totalWords: number;
  uniqueWords: number;
  vocabularyDensity: number;
  readabilityIndex: number;
  wordsPerSentence: number;
  frequentWords: Array<{word: string, count: number}>;
  created: string;
}

const DocumentSummary = () => {
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Define fetchSummary as a component method for reuse with error retry
  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/document/summary');
      
      if (response.status === 503) {
        throw new Error('Data is being processed. Please try again in a moment.');
      }
      if (!response.ok) {
        throw new Error(`Failed to load summary: ${response.statusText}`);
      }

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching document summary:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Document Summary</h2>
      <div className="w-full bg-gray-50 rounded p-6 overflow-auto">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center py-8">
            <p className="text-gray-500">Loading document summary...</p>
          </div>
        ) : error ? (
          <ChartError 
            message={error}
            onRetry={fetchSummary}
          />
        ) : summary ? (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              This corpus has {summary.totalDocuments.toLocaleString()} document{summary.totalDocuments !== 1 ? 's' : ''} with {summary.totalWords.toLocaleString()} total words 
              and {summary.uniqueWords.toLocaleString()} unique word forms. Created {summary.created}.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-1">Vocabulary Density:</h3>
                <p className="text-xl font-bold text-indigo-600">{summary.vocabularyDensity.toFixed(3)}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Readability Index:</h3>
                <p className="text-xl font-bold text-blue-600">{summary.readabilityIndex.toFixed(3)}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Average Words Per Sentence:</h3>
                <p className="text-xl font-bold text-green-600">{summary.wordsPerSentence.toFixed(1)}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Most frequent words in the corpus:</h3>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  {summary.frequentWords.map((item, index) => (
                    <li key={index} className="text-gray-700">
                      <span className="font-medium text-yellow-600">{item.word}</span> ({item.count.toLocaleString()})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500">No document summary available.</p>
        )}
      </div>
    </div>
  );
};

export default DocumentSummary; 