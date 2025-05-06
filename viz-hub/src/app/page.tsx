'use client';

import { useEffect, useState } from 'react';
import SentimentChartV2 from '../components/SentimentChart_v2';
import DataDistribution from '../components/DataDistribution';
import WordCloud from '@/components/WordCloud';
import DocumentSummary from '../components/DocumentSummary';
import UploadPage from '../components/UploadPage';
import { STORAGE_KEYS, useDataStore } from '../store/dataStore';

export default function Home() {
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { checkDataStatus } = useDataStore();
  
  // Check for uploaded data
  useEffect(() => {
    const checkData = () => {
      // Check if any of the required data types exists in localStorage
      const dataExists = Object.values(STORAGE_KEYS).some(key => 
        localStorage.getItem(key) !== null
      );
      setHasData(dataExists);
      
      if (dataExists) {
        // Update data status in the store if data exists
        checkDataStatus();
      }
      
      setIsLoading(false);
    };
    
    checkData();
    
    // Listen for storage changes in case data is uploaded in another tab
    window.addEventListener('storage', checkData);
    return () => window.removeEventListener('storage', checkData);
  }, [checkDataStatus]);
  
  // Handle successful upload
  const handleUploadSuccess = () => {
    setHasData(true);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show upload page if no data
  if (!hasData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <UploadPage onUploadSuccess={handleUploadSuccess} />
      </div>
    );
  }
  
  // Render visualizations if data is available
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Text Analysis Visualization Hub</h1>
        <p className="text-gray-600">Interactive analysis developed by ClioX</p>
        
        <div className="mt-4">
          <button
            onClick={() => {
              localStorage.clear();
              setHasData(false);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Clear Data & Upload New File
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DataDistribution
            title="Data Distribution on Email Counts"
            description="Shows the distribution of email counts over time"
            type="email"
            skipLoading={true}
            disableHover={true}
          />
          
          <DataDistribution
            title="Data Distribution on Date"
            description="Shows the distribution of emails by date"
            type="date"
            skipLoading={true}
            disableHover={true}
          />
        </div>

        <div className="mb-6">
          <SentimentChartV2 skipLoading={true} />
        </div>

        <div className="mb-6">
          <WordCloud />
        </div>

        <div className="mb-6">
          <DocumentSummary skipLoading={true} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Further more ...</h2>
          <p className="text-gray-600">Additional visualizations and analysis tools will be added here.</p>
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ClioX</p>
      </footer>
    </div>
  );
}
