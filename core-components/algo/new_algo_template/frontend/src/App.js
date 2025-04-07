import React, { useState, useEffect } from 'react';
import './styles/App.css'; 
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [loading, setLoading] = useState(false);
  const [corpus, setCorpus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // placeholder for any initial data fetching or setup
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_path: '../../data/inputs/enron/enron_subset.csv'
        }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setCorpus(data.corpus);
      } else {
        setError(data.message || 'An error occurred during analysis');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Text Analysis Visualization Hub</h1>
          <p>Interactive analysis developed by ClioX</p>
        </header>
        
        {!corpus && (
          <div className="analyze-section">
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="analyze-button"
            >
              {loading ? 'Analyzing...' : 'Analyze Email Data'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>
        )}
        
        <Routes>
          <Route path="/" element={<Dashboard corpus={corpus} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;