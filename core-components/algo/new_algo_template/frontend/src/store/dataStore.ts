import { create } from 'zustand';

// API Configuration
const API_CONFIG = {
  baseUrl: 'http://localhost:5001',
  endpoints: {
    status: '/api/status',
    process: '/api/process',
    emailDistribution: '/api/distribution/email',
    dateDistribution: '/api/distribution/date',
    sentiment: '/api/sentiment',
    wordcloud: '/api/wordcloud',
    documentSummary: '/api/document/summary'
  }
};

// Define the types for our store
interface DataStatus {
  emailDistribution: boolean;
  dateDistribution: boolean;
  sentimentChart: boolean;
  sentimentChartV2: boolean;
  wordCloud: boolean;
  documentSummary: boolean;
}

export type ProcessingStatus = 'checking' | 'ready' | 'not_ready' | 'processing' | 'error';

// Define the API response structure
interface StatusResponse {
  status: 'ready' | 'not_ready' | 'processing' | 'error';
  components?: {
    email_distribution: boolean;
    date_distribution: boolean;
    sentiment_chart: boolean;
    wordcloud: boolean;
    document_summary?: boolean;
    cleaned_data?: boolean;
  };
}

interface DataStore {
  // Data status for each component
  dataStatus: DataStatus;
  setComponentStatus: (component: keyof DataStatus, status: boolean) => void;
  setAllComponentStatus: (statuses: Partial<DataStatus>) => void;
  
  // Global processing status
  processingStatus: ProcessingStatus;
  setProcessingStatus: (status: ProcessingStatus) => void;
  
  // Status message
  statusMessage: string;
  setStatusMessage: (message: string) => void;
  
  // API URL getter
  getApiUrl: (endpoint: keyof typeof API_CONFIG.endpoints) => string;
  
  // Check data status from the backend
  checkDataStatus: () => Promise<StatusResponse>;
  
  // Trigger data processing
  processData: () => Promise<void>;
  
  // Data fetching functions for components
  fetchEmailDistribution: () => Promise<string>;
  fetchDateDistribution: () => Promise<string>;
  fetchSentimentData: () => Promise<any>;
  fetchWordCloudData: () => Promise<any>;
  fetchDocumentSummary: () => Promise<any>;
}

export const useDataStore = create<DataStore>((set, get) => ({
  // Initial data status
  dataStatus: {
    emailDistribution: false,
    dateDistribution: false,
    sentimentChart: false,
    sentimentChartV2: false,
    wordCloud: false,
    documentSummary: false
  },
  
  // Set status for a single component
  setComponentStatus: (component, status) => set(state => ({
    dataStatus: {
      ...state.dataStatus,
      [component]: status
    }
  })),
  
  // Set status for multiple components at once
  setAllComponentStatus: (statuses) => set(state => ({
    dataStatus: {
      ...state.dataStatus,
      ...statuses
    }
  })),
  
  // Global processing status
  processingStatus: 'checking',
  setProcessingStatus: (status) => set({ processingStatus: status }),
  
  // Status message
  statusMessage: '',
  setStatusMessage: (message) => set({ statusMessage: message }),
  
  // API URL getter
  getApiUrl: (endpoint) => `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[endpoint]}`,
  
  // Check data status from the backend
  checkDataStatus: async () => {
    try {
      set({ processingStatus: 'checking' });
      
      // Check if backend is available
      const response = await fetch(get().getApiUrl('status'));
      const data = await response.json() as StatusResponse;
      
      console.log('Status response:', data);
      
      // Update component status
      if (data.components) {
        const components = data.components;
        const documentSummaryAvailable = !!(components.document_summary || components.cleaned_data);
        
        console.log('Document summary available:', documentSummaryAvailable);
        console.log('Components status:', components);
        
        set({
          dataStatus: {
            emailDistribution: components.email_distribution,
            dateDistribution: components.date_distribution,
            sentimentChart: components.sentiment_chart,
            sentimentChartV2: components.sentiment_chart,
            wordCloud: components.wordcloud,
            documentSummary: documentSummaryAvailable
          }
        });
      }
      
      // Update global status
      if (data.status === 'ready') {
        set({ processingStatus: 'ready' });
      } else if (data.status === 'not_ready') {
        set({ processingStatus: 'not_ready' });
      } else if (data.status === 'error') {
        set({ 
          processingStatus: 'error',
          statusMessage: 'Error processing data'
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error checking data status:', error);
      set({ 
        processingStatus: 'error',
        statusMessage: 'Error connecting to the backend server. Please make sure it is running.'
      });
      throw error;
    }
  },
  
  // Process data
  processData: async () => {
    try {
      set({ 
        processingStatus: 'processing',
        statusMessage: 'Processing data... This may take a few minutes.'
      });
      
      // Trigger data processing
      await fetch(get().getApiUrl('process'));
      
      // Start polling for status updates
      const pollInterval = setInterval(async () => {
        try {
          const statusData = await get().checkDataStatus();
          
          // If processing is complete or there was an error, stop polling
          if (statusData.status === 'ready' || statusData.status === 'error') {
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Error during polling:', error);
          clearInterval(pollInterval);
        }
      }, 2000);
      
      // Don't return the cleanup function, as it violates the Promise<void> return type
      // Instead, we'll store it in a variable that gets garbage collected when the component unmounts
      const cleanup = () => clearInterval(pollInterval);
    } catch (error) {
      console.error('Error processing data:', error);
      set({ 
        processingStatus: 'error',
        statusMessage: 'Error processing data'
      });
      throw error;
    }
  },
  
  // Data fetching functions for components
  fetchEmailDistribution: async () => {
    try {
      const response = await fetch(get().getApiUrl('emailDistribution'));
      if (response.status === 503) {
        throw new Error('Data is being processed. Please try again in a moment.');
      }
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      
      // Return the CSV text directly
      const csvText = await response.text();
      return csvText;
    } catch (error) {
      console.error('Error fetching email distribution data:', error);
      throw error;
    }
  },
  
  fetchDateDistribution: async () => {
    try {
      const response = await fetch(get().getApiUrl('dateDistribution'));
      if (response.status === 503) {
        throw new Error('Data is being processed. Please try again in a moment.');
      }
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      
      // Return the CSV text directly
      const csvText = await response.text();
      return csvText;
    } catch (error) {
      console.error('Error fetching date distribution data:', error);
      throw error;
    }
  },
  
  fetchSentimentData: async () => {
    try {
      const response = await fetch(get().getApiUrl('sentiment'));
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      throw error;
    }
  },
  
  fetchWordCloudData: async () => {
    try {
      const response = await fetch(get().getApiUrl('wordcloud'));
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching word cloud data:', error);
      throw error;
    }
  },
  
  fetchDocumentSummary: async () => {
    try {
      const response = await fetch(get().getApiUrl('documentSummary'));
      if (response.status === 503) {
        throw new Error('Data is being processed. Please try again in a moment.');
      }
      if (!response.ok) {
        console.error(`Document summary fetch failed with status: ${response.status}`);
        throw new Error(`Failed to load document summary: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // If we received an error message from the backend
      if (data && data.status === 'error') {
        throw new Error(data.message || 'Failed to fetch document summary data');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching document summary:', error);
      throw error;
    }
  }
})); 