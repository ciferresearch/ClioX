'use client';

import { useState, useEffect } from 'react';
import SentimentChart from '../components/SentimentChart';
import SentimentChartV2 from '../components/SentimentChart_v2';
import DataDistribution from '../components/DataDistribution';
import WordCloud from '@/components/WordCloud';
import DocumentSummary from '../components/DocumentSummary';

export default function Home() {
  const [processingStatus, setProcessingStatus] = useState<'checking' | 'ready' | 'not_ready' | 'processing' | 'error'>('checking');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Check if data has been processed
  useEffect(() => {
    const checkAndProcessData = async () => {
      try {
        setProcessingStatus('checking');
        // First check if data is already processed
        const response = await fetch('http://localhost:5001/api/status');
        const data = await response.json();

        if (data.status === 'ready') {
          // Data is already processed, we can show the visualizations
          setProcessingStatus('ready');
        } else {
          // Data needs processing, start it automatically
          setProcessingStatus('processing');
          setStatusMessage('Processing data... This may take a few minutes.');

          // Trigger data processing
          const processResponse = await fetch('http://localhost:5001/api/process');
          const processData = await processResponse.json();

          if (processData.status === 'success') {
            setProcessingStatus('ready');
            setStatusMessage('Data processing completed successfully!');
          } else {
            setProcessingStatus('error');
            setStatusMessage(`Error processing data: ${processData.message}`);
          }
        }
      } catch (error) {
        setProcessingStatus('error');
        setStatusMessage('Error connecting to the backend server. Please make sure it is running.');
        console.error('Error:', error);
      }
    };

    checkAndProcessData();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Text Analysis Visualization Hub</h1>
        <p className="text-gray-600">Interactive analysis developed by ClioX</p>

        {/* Processing status and controls */}
        {processingStatus === 'processing' && (
          <div className="mt-4 bg-blue-100 text-blue-800 p-3 rounded-md">
            <p>{statusMessage}</p>
            <div className="mt-2 w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse"></div>
            </div>
          </div>
        )}

        {processingStatus === 'error' && (
          <div className="mt-4 bg-red-100 text-red-800 p-3 rounded-md">
            <p>{statusMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto">
        {processingStatus === 'ready' ? (
          <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DataDistribution
            title="Data Distribution on Email Counts"
            description="Shows the distribution of email counts over time"
            dataSource="http://localhost:5001/api/distribution/email"
          />

          <DataDistribution
            title="Data Distribution on Date"
            description="Shows the distribution of emails by date"
            dataSource="http://localhost:5001/api/distribution/date"
          />
        </div>

        <div className="mb-6">
          <SentimentChart />
        </div>

        <div className="mb-6">
          <SentimentChartV2 />
        </div>

        <div className="mb-6">
          <WordCloud />
        </div>

        {/* <div className="mb-6">
          <TagCloud />
        </div> */}

        <div className="mb-6">
          <DocumentSummary />
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Further more ...</h2>
          <p className="text-gray-600">Additional visualizations and analysis tools will be added here.</p>
        </div>
          </>
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            {/* Logo placeholder */}
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-4xl font-bold">ClioX</span>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              {processingStatus === 'processing'
                ? 'Processing Data...'
                : processingStatus === 'error'
                  ? 'Error Processing Data'
                  : 'Initializing...'}
            </h2>

            <p className="text-gray-600 mb-6">
              {processingStatus === 'processing'
                ? 'Please wait while we process the data. This may take a few minutes.'
                : processingStatus === 'error'
                  ? statusMessage
                  : 'Preparing your visualizations...'}
            </p>

            {/* Loading animation */}
            {processingStatus === 'processing' && (
              <div className="w-full max-w-md mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-pulse"></div>
              </div>
            )}

            {/* Error retry button */}
            {processingStatus === 'error' && (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ClioX</p>
      </footer>
    </div>
  );
}
