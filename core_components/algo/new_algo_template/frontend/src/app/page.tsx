'use client';

import { useEffect } from 'react';
import SentimentChartV2 from '../components/SentimentChart_v2';
import DataDistribution from '../components/DataDistribution';
import WordCloud from '@/components/WordCloud';
import DocumentSummary from '../components/DocumentSummary';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useDataStore } from '@/store/dataStore';

export default function Home() {
  // Get state and actions from the zustand store
  const { 
    dataStatus, 
    processingStatus, 
    statusMessage, 
    checkDataStatus, 
    processData 
  } = useDataStore();

  // Log data status when it changes
  useEffect(() => {
    console.log("Data status updated:", dataStatus);
  }, [dataStatus]);

  // Check data status on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Checking initial data status");
        // Check initial data status
        const statusData = await checkDataStatus();
        console.log("Initial status data:", statusData);
        
        // If data needs processing, start it automatically
        if (statusData.status === 'not_ready') {
          console.log("Data not ready, starting processing");
          processData();
        }
      } catch (error) {
        console.error('Error in initial data fetch:', error);
      }
    };

    fetchData();
  }, [checkDataStatus, processData]);

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
              type="email"
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
              type="date"
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
            <WordCloud />
          ) : (
            <SkeletonLoader type="wordcloud" height="h-96" />
          )}
        </div>

        <div className="mb-6">
          {dataStatus.documentSummary ? (
            <DocumentSummary skipLoading={false} />
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
