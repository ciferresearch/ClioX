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
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        uploading: false,
        error: `Upload failed: ${err.message}`,
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

        <div className="mb-4">
          <input
            type="file"
            onChange={(e) => handleFileChange(e, type)}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept=".csv,.json,.txt"
            disabled={state.uploading || state.success}
          />
          {state.file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {state.file.name} ({(state.file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <button
          onClick={() => handleUpload(type)}
          disabled={!state.file || state.uploading || state.success}
          className={`w-full py-2 px-4 rounded-md font-medium text-white ${
            !state.file || state.uploading || state.success
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
        >
          {state.uploading ? 'Uploading...' : state.success ? 'Uploaded ✓' : 'Upload File'}
        </button>

        {state.error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {state.error}
          </div>
        )}
      </div>
    );
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
