'use client';

import { useEffect, useState } from 'react';

interface DocumentStats {
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
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching summary data from an API
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call to your backend
        // Example: const response = await fetch('/api/document-stats');
        // const data = await response.json();
        
        // Sample statistics for demonstration
        const sampleStats: DocumentStats = {
          totalDocuments: 1,
          totalWords: 55785,
          uniqueWords: 5741,
          vocabularyDensity: 0.103,
          readabilityIndex: 18.678,
          wordsPerSentence: 55785.0,
          frequentWords: [
            { word: 'ect', count: 1387 },
            { word: 'enron', count: 716 },
            { word: 'subject', count: 436 },
            { word: 'forwarded', count: 419 },
            { word: 'cc', count: 419 }
          ],
          created: new Date().toLocaleString()
        };
        
        // Simulate network delay
        setTimeout(() => {
          setStats(sampleStats);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching document statistics:', error);
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Document Summary</h2>
      <div className="w-full bg-gray-50 rounded p-6 overflow-auto">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center py-8">
            <p className="text-gray-500">Loading document statistics...</p>
          </div>
        ) : stats ? (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              This corpus has {stats.totalDocuments} document with {stats.totalWords.toLocaleString()} total words 
              and {stats.uniqueWords.toLocaleString()} unique word forms. Created {stats.created}.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-1">Vocabulary Density:</h3>
                <p className="text-xl font-bold text-indigo-600">{stats.vocabularyDensity.toFixed(3)}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Readability Index:</h3>
                <p className="text-xl font-bold text-blue-600">{stats.readabilityIndex.toFixed(3)}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-1">Average Words Per Sentence:</h3>
                <p className="text-xl font-bold text-green-600">{stats.wordsPerSentence.toFixed(1)}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Most frequent words in the corpus:</h3>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  {stats.frequentWords.map((item, index) => (
                    <li key={index} className="text-gray-700">
                      <span className="font-medium text-yellow-600">{item.word}</span> ({item.count})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500">No document statistics available.</p>
        )}
      </div>
    </div>
  );
};

export default DocumentSummary; 