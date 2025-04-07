/**
 * API utility functions
 */

// Base URL
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Analyze email data
 * @param {string} filePath - Path to CSV file
 * @returns {Promise} - Promise containing analysis results
 */
export const analyzeData = async (filePath) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_path: filePath }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing data:', error);
    throw error;
  }
};

/**
 * Get sentiment analysis data
 * @returns {Promise} - Promise containing sentiment analysis data
 */
export const getSentimentData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/sentiment`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    throw error;
  }
};

/**
 * Get image URL
 * @param {string} imageName - Image name
 * @returns {string} - Image URL
 */
export const getImageUrl = (imageName) => {
  return `${API_BASE_URL}/images/${imageName}`;
};