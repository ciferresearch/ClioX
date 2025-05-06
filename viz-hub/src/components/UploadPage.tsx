import React, { useState, useEffect } from 'react';
import { useDataStore, STORAGE_KEYS } from '../store/dataStore';

interface UploadPageProps {
  onUploadSuccess: () => void;
}

type VisualizationType = 'wordCloud' | 'dateDistribution' | 'emailDistribution' | 'sentiment' | 'documentSummary';

interface FileUploadState {
  file: File | null;
  uploading: boolean;
  error: string | null;
  success: boolean;
}

const initialFileState: FileUploadState = {
  file: null,
  uploading: false,
  error: null,
  success: false
};

const UploadPage: React.FC<UploadPageProps> = ({ onUploadSuccess }) => {
  const { saveData, checkDataStatus } = useDataStore();

  const [wordCloudFile, setWordCloudFile] = useState<FileUploadState>({...initialFileState});
  const [dateDistributionFile, setDateDistributionFile] = useState<FileUploadState>({...initialFileState});
  const [emailDistributionFile, setEmailDistributionFile] = useState<FileUploadState>({...initialFileState});
  const [sentimentFile, setSentimentFile] = useState<FileUploadState>({...initialFileState});
  const [documentSummaryFile, setDocumentSummaryFile] = useState<FileUploadState>({...initialFileState});

  const [allUploaded, setAllUploaded] = useState(false);

  // Check if all required files are uploaded
  useEffect(() => {
    const allSuccess =
      wordCloudFile.success &&
      dateDistributionFile.success &&
      emailDistributionFile.success &&
      sentimentFile.success &&
      documentSummaryFile.success;

    setAllUploaded(allSuccess);

    if (allSuccess) {
      checkDataStatus();
      onUploadSuccess();
    }
  }, [
    wordCloudFile.success,
    dateDistributionFile.success,
    emailDistributionFile.success,
    sentimentFile.success,
    documentSummaryFile.success,
    checkDataStatus,
    onUploadSuccess
  ]);

  const getStateUpdater = (type: VisualizationType) => {
    switch (type) {
      case 'wordCloud': return setWordCloudFile;
      case 'dateDistribution': return setDateDistributionFile;
      case 'emailDistribution': return setEmailDistributionFile;
      case 'sentiment': return setSentimentFile;
      case 'documentSummary': return setDocumentSummaryFile;
    }
  };

  const getStorageKey = (type: VisualizationType) => {
    switch (type) {
      case 'wordCloud': return STORAGE_KEYS.WORD_CLOUD;
      case 'dateDistribution': return STORAGE_KEYS.DATE_DISTRIBUTION;
      case 'emailDistribution': return STORAGE_KEYS.EMAIL_DISTRIBUTION;
      case 'sentiment': return STORAGE_KEYS.SENTIMENT;
      case 'documentSummary': return STORAGE_KEYS.DOCUMENT_SUMMARY;
    }
  };

  const getFileState = (type: VisualizationType) => {
    switch (type) {
      case 'wordCloud': return wordCloudFile;
      case 'dateDistribution': return dateDistributionFile;
      case 'emailDistribution': return emailDistributionFile;
      case 'sentiment': return sentimentFile;
      case 'documentSummary': return documentSummaryFile;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: VisualizationType) => {
    const setState = getStateUpdater(type);

    if (e.target.files && e.target.files[0]) {
      setState(prev => ({
        ...prev,
        file: e.target.files![0],
        error: null,
        success: false
      }));
    }
  };

  const handleUpload = async (type: VisualizationType) => {
    const setState = getStateUpdater(type);
    const state = getFileState(type);
    const storageKey = getStorageKey(type);

    if (!state.file) {
      setState(prev => ({
        ...prev,
        error: 'Please select a file first'
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        uploading: true,
        error: null
      }));

      // Read file locally - no backend required
      const reader = new FileReader();

      reader.onload = (event) => {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }

        const fileContent = event.target.result as string;

        // Store data in browser using dataStore
        saveData(storageKey, fileContent, state.file!.name, state.file!.type);

        setState(prev => ({
          ...prev,
          uploading: false,
          success: true
        }));
      };

      reader.onerror = () => {
        throw new Error('File reading error');
      };

      // Read by file type
      if (state.file.type.includes('text') || state.file.type.includes('json') || state.file.type.includes('csv')) {
        reader.readAsText(state.file);
      } else {
        reader.readAsDataURL(state.file);
      }
    } catch (err: unknown) {
      setState(prev => ({
        ...prev,
        uploading: false,
        error: `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        success: false
      }));
      console.error('Upload error:', err);
    }
  };

  const renderFileUpload = (type: VisualizationType, title: string, description: string) => {
    const state = getFileState(type);

    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        <div className="mb-2">
          <div className="relative">
            <input
              id={`file-input-${type}`}
              type="file"
              onChange={(e) => handleFileChange(e, type)}
              className="sr-only"  // Hide the actual input but keep it functional
              accept=".csv,.json,.txt"
              disabled={state.uploading || state.success}
            />
            
            <label 
              htmlFor={`file-input-${type}`}
              className={`flex items-center justify-between px-4 py-2 w-full border ${state.file ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${(state.uploading || state.success) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {state.file ? (
                  <span className="text-blue-600 font-medium">{state.file.name}</span>
                ) : (
                  <span className="text-gray-500">Select a file...</span>
                )}
              </div>
              <span className={`ml-2 px-3 py-1 text-xs rounded-md ${state.file ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                Browse
              </span>
            </label>
          </div>
          
          {/* Info area - always visible with different content */}
          <div className="h-8 mt-2 flex items-center">
            {state.file ? (
              <p className="text-xs text-gray-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {(state.file.size / 1024).toFixed(2)} KB · {state.file.type || 'unknown type'}
              </p>
            ) : (
              <p className="text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getFileTypeHint(type)}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => handleUpload(type)}
          disabled={!state.file || state.uploading || state.success}
          className={`w-full px-4 py-2 rounded-lg text-sm transition-colors ${
            !state.file || state.uploading || state.success
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
          }`}
        >
          {state.uploading ? "Uploading..." : state.success ? "Uploaded" : "Upload File"}
        </button>

        {state.error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{state.error}</span>
          </div>
        )}
      </div>
    );
  };

  const getFileTypeHint = (type: VisualizationType): string => {
    switch (type) {
      case 'wordCloud':
        return 'Accepts TXT or JSON files with word frequencies data';
      case 'dateDistribution':
        return 'CSV format with "time" and "count" columns recommended';
      case 'emailDistribution':
        return 'CSV format with "emails_per_day" column required';
      case 'sentiment':
        return 'JSON format with sentiment categories and values';
      case 'documentSummary':
        return 'Upload text content or JSON with document statistics';
      default:
        return 'Select a supported file (.csv, .json, .txt)';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Upload Visualization Data</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderFileUpload('wordCloud', 'Word Cloud Data', 'Upload a text file or JSON with word frequencies for the word cloud visualization.')}
        {renderFileUpload('dateDistribution', 'Date Distribution Data', 'Upload a CSV file with time and count columns for the date distribution chart.')}
        {renderFileUpload('emailDistribution', 'Email Distribution Data', 'Upload a CSV file with emails_per_day column for the email distribution chart.')}
        {renderFileUpload('sentiment', 'Sentiment Data', 'Upload a JSON file with sentiment categories and values for the sentiment chart.')}
        {renderFileUpload('documentSummary', 'Document Summary Data', 'Upload a text file or JSON with document statistics for the document summary.')}
      </div>

      {allUploaded && (
        <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-md text-center">
          All files uploaded successfully! You can now view the visualizations.
        </div>
      )}

      <p className="mt-6 text-sm text-gray-600 text-center">
        Supported file formats: CSV, JSON, TXT
      </p>
    </div>
  );
};

export default UploadPage;
