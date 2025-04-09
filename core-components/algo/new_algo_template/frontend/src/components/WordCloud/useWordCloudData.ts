import { useState, useCallback, useEffect } from 'react';
import { WordData } from './types';

export const useWordCloudData = () => {
  const [words, setWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define fetchData as a component method for reuse
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // const response = await fetch('http://localhost:5001/api/wordcloud');
      
      // TODO: Remove this once we have a real endpoint
      const response = await fetch("/data/temp/processed_wordcloud.json");
      
      if (response.status === 503) {
        throw new Error('Data is being processed. Please try again in a moment.');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load word cloud data: ${response.statusText}`);
      }

      const data = await response.json();
      setWords(data.wordCloudData);
    } catch (error) {
      console.error('Error fetching word cloud data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data only once on initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    words,
    isLoading,
    error,
    fetchData
  };
}; 