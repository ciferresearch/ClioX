'use client';

import { useState, useEffect } from 'react';
import SentimentChartV2 from '../components/SentimentChart_v2';
import DataDistribution from '../components/DataDistribution';
import WordCloud from '@/components/WordCloud';
import DocumentSummary from '../components/DocumentSummary';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function Home() {
  // State for tracking data loading status
  const [dataStatus, setDataStatus] = useState({
    emailDistribution: false,
    dateDistribution: false,
    sentimentChart: false,
    sentimentChartV2: false,
    wordCloud: false,
    documentSummary: false
  });

  // Global processing status
  const [processingStatus, setProcessingStatus] = useState<'checking' | 'ready' | 'not_ready' | 'processing' | 'error'>('checking');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Check data status on load
  useEffect(() => {
    const checkDataStatus = async () => {
      try {
        setProcessingStatus('checking');

        // Check if backend is available
        const response = await fetch('http://localhost:5001/api/status');
        const data = await response.json();

        console.log('Status response:', data);

        // Update component status
        if (data.components) {
          setDataStatus({
            emailDistribution: data.components.email_distribution,
            dateDistribution: data.components.date_distribution,
            sentimentChart: data.components.sentiment_chart,
            sentimentChartV2: data.components.sentiment_chart,
            wordCloud: data.components.wordcloud,
            documentSummary: data.components.document_summary || data.components.cleaned_data
          });
        }

        // Update global status
        if (data.status === 'ready') {
          setProcessingStatus('ready');
        } else {
          // Data needs processing, start it automatically
          setProcessingStatus('processing');
          setStatusMessage('Processing data... This may take a few minutes.');

          // Trigger data processing
          await fetch('http://localhost:5001/api/process');

          // Poll for status updates
          const intervalId = setInterval(async () => {
            try {
              const statusResponse = await fetch('http://localhost:5001/api/status');
              const statusData = await statusResponse.json();

              console.log('Polling status:', statusData);

              if (statusData.components) {
                setDataStatus({
                  emailDistribution: statusData.components.email_distribution,
                  dateDistribution: statusData.components.date_distribution,
                  sentimentChart: statusData.components.sentiment_chart,
                  sentimentChartV2: statusData.components.sentiment_chart,
                  wordCloud: statusData.components.wordcloud,
                  documentSummary: statusData.components.document_summary || statusData.components.cleaned_data
                });
              }

              // Update global status
              if (statusData.status === 'ready') {
                setProcessingStatus('ready');
                clearInterval(intervalId);
              } else if (statusData.status === 'error') {
                setProcessingStatus('error');
                setStatusMessage('Error processing data');
                clearInterval(intervalId);
              }
            } catch (error) {
              console.error('Error checking status:', error);
            }
          }, 2000);

          // Clean up interval
          return () => clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error checking data status:', error);
        setProcessingStatus('error');
        setStatusMessage('Error connecting to the backend server. Please make sure it is running.');
      }
    };

    checkDataStatus();
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {dataStatus.emailDistribution ? (
            <DataDistribution
              title="Data Distribution on Email Counts"
              description="Shows the distribution of email counts over time"
              dataSource="http://localhost:5001/api/distribution/email"
              skipLoading={true}
              disableHover={true}
            />
          ) : (
            <SkeletonLoader type="chart" height="h-64" />
          )}

          {dataStatus.dateDistribution ? (
            <DataDistribution
              title="Data Distribution on Date"
              description="Shows the distribution of emails by date"
              dataSource="http://localhost:5001/api/distribution/date"
              skipLoading={true}
              disableHover={true}
            />
          ) : (
            <SkeletonLoader type="chart" height="h-64" />
          )}
        </div>

        {/* <div className="mb-6">
          {dataStatus.sentimentChart ? (
            <SentimentChart />
          ) : (
            <SkeletonLoader type="chart" height="h-64" />
          )}
        </div> */}

        <div className="mb-6">
          {dataStatus.sentimentChartV2 ? (
            <SentimentChartV2 skipLoading={true} />
          ) : (
            <SkeletonLoader type="chart" height="h-64" />
          )}
        </div>

        <div className="mb-6">
          {dataStatus.wordCloud ? (
            <WordCloud skipLoading={true} />
          ) : (
            <SkeletonLoader type="wordcloud" height="h-96" />
          )}
        </div>

        <div className="mb-6">
          {dataStatus.documentSummary ? (
            <DocumentSummary skipLoading={true} />
          ) : (
            <SkeletonLoader type="document" height="h-64" />
          )}
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
