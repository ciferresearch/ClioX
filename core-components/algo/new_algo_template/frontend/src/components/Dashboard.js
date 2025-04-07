import React, { useState, useEffect } from 'react';
import WordCloud from './WordCloud';
import SentimentAnalysis from './SentimentAnalysis';
import './Dashboard.css';

const Dashboard = ({ corpus }) => {
  const [sentimentData, setSentimentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!corpus) return;

    const fetchSentimentData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/data/sentiment');
        const data = await response.json();
        setSentimentData(data);
      } catch (error) {
        console.error('Error fetching sentiment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentimentData();
  }, [corpus]);

  if (!corpus) {
    return <div className="no-data">Please analyze data first</div>;
  }

  if (loading) {
    return <div className="loading">Loading visualization data...</div>;
  }

  return (
    <div className="dashboard">
      <div className="grid-container">
        <div className="tool-container">
          <h2>Data distribution on email counts</h2>
          <img src="http://localhost:5001/api/images/email_per_day" alt="Email per day distribution" />
        </div>

        <div className="tool-container">
          <h2>Data distribution on Date</h2>
          <img src="http://localhost:5001/api/images/date_distribution" alt="Date distribution" />
        </div>
      </div>

      <div className="tool-container full-width">
        <h2>📊 Word Cloud</h2>
        <WordCloud corpus={corpus} />
      </div>

      <div className="tool-container full-width">
        <h2>📝 Document Summary</h2>
        <iframe 
          title="Document Summary"
          id="summary-frame" 
          src={`http://localhost:8888/tool/Summary/?corpus=${corpus}`}
          style={{ width: '100%', height: '400px', border: 'none' }}
        />
      </div>
      
      <div className="tool-container full-width">
        <h2>📈 Sentiment Analysis</h2>
        <SentimentAnalysis data={sentimentData} />
      </div>
    </div>
  );
};

export default Dashboard;