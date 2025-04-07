import React from 'react';

const WordCloud = ({ corpus }) => {
  return (
    <iframe 
      title="Word Cloud"
      id="cirrus-frame" 
      src={`http://localhost:8888/tool/Cirrus/?corpus=${corpus}`}
      style={{ width: '100%', height: '400px', border: 'none' }}
    />
  );
};

export default WordCloud;