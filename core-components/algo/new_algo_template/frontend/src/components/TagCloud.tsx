'use client';

import { useEffect, useState, useMemo } from 'react';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleLog } from '@visx/scale';
import Wordcloud from '@visx/wordcloud/lib/Wordcloud';

interface WordData {
  value: string;
  count: number;
}

interface Word {
  text: string;
  value: number;
}

const width = 800;
const height = 500;

// Custom color options
const customColors = [
  '#ff6b6b', '#4ecdc4', '#1a535c', '#ffe66d', '#ff9f1c', 
  '#6a0572', '#ab83a1', '#1a936f', '#114b5f', '#88d498',
  '#3772ff', '#df2935', '#fdca40', '#f79824', '#197278',
  '#5d576b', '#9bc53d', '#f18f01', '#006e90', '#2e294e'
];

const TagCloud = () => {
  const [words, setWords] = useState<Array<WordData>>([]);
  const [filteredWords, setFilteredWords] = useState<Array<WordData>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [minFrequency, setMinFrequency] = useState(0);
  const [maxWords, setMaxWords] = useState(100);
  const [colorSelection, setColorSelection] = useState('random');

  // Fetch word cloud data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/data/temp/processed_wordcloud.json');
        const data = await response.json();
        setWords(data.wordCloudData);
        setFilteredWords(data.wordCloudData);
      } catch (error) {
        console.error('Error fetching word cloud data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter words based on search term and frequency
  useEffect(() => {
    let filtered = [...words];
    
    // Filter by frequency
    filtered = filtered.filter(word => word.count >= minFrequency);
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(word => 
        word.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Limit to max words and sort by frequency
    filtered = filtered
      .sort((a, b) => b.count - a.count)
      .slice(0, maxWords);
    
    setFilteredWords(filtered);
  }, [words, searchTerm, minFrequency, maxWords]);

  // Transform data for visx wordcloud
  const wordcloudData = useMemo(() => {
    return filteredWords.map(w => ({
      text: w.value,
      value: w.count
    }));
  }, [filteredWords]);

  // Get color based on selection and word frequency
  const getWordColor = (word: Word) => {
    const maxCount = Math.max(...filteredWords.map(w => w.count));
    const ratio = word.value / maxCount;

    switch (colorSelection) {
      case 'monochrome':
        return `rgba(0, 0, 255, ${0.3 + ratio * 0.7})`;
      case 'category':
        if (ratio > 0.8) return '#d00000';
        if (ratio > 0.6) return '#03045e';
        if (ratio > 0.4) return '#0077b6';
        if (ratio > 0.2) return '#00b4d8';
        return '#90e0ef';
      case 'random':
      default:
        return customColors[Math.floor(Math.random() * customColors.length)];
    }
  };

  // Font size scale
  const fontSize = scaleLog({
    domain: [
      Math.min(...filteredWords.map(w => w.count)),
      Math.max(...filteredWords.map(w => w.count))
    ],
    range: [12, 50],
    base: 2
  });

  const minCount = words.length > 0 ? Math.min(...words.map(w => w.count)) : 0;
  const maxCount = words.length > 0 ? Math.max(...words.map(w => w.count)) : 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full overflow-hidden">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Tag Cloud (visx)</h2>
      
      {/* Interactive controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search terms</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter words..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum frequency: {minFrequency}
          </label>
          <input
            type="range"
            min={minCount}
            max={maxCount}
            value={minFrequency}
            onChange={(e) => setMinFrequency(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max words: {maxWords}
          </label>
          <input
            type="range"
            min={10}
            max={300}
            value={maxWords}
            onChange={(e) => setMaxWords(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color scheme
          </label>
          <select
            value={colorSelection}
            onChange={(e) => setColorSelection(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="random">Colorful (Random)</option>
            <option value="monochrome">Monochrome (Blue)</option>
            <option value="category">Categorical (by frequency)</option>
          </select>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Tag cloud visualization */}
        <div className="flex-1 h-[500px] bg-gray-50 rounded flex items-center justify-center p-4 overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500">Loading tag cloud...</p>
            </div>
          ) : filteredWords.length > 0 ? (
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/10" />
              <Wordcloud
                words={wordcloudData}
                width={width}
                height={height}
                fontSize={(w) => fontSize(w.value)}
                font="Inter"
                padding={2}
                spiral="rectangular"
                rotate={(w) => (w.text.length > 5 ? 90 : 0)}
              >
                {(cloudWords) =>
                  <Group>
                    {cloudWords.map((w, i) => (
                      <Text
                        key={w.text}
                        fill={getWordColor(w)}
                        textAnchor="middle"
                        transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                        fontSize={w.size}
                        fontFamily="Inter"
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          ':hover': {
                            opacity: 0.7,
                          },
                        }}
                        onClick={() => {
                          const wordData = filteredWords.find(fw => fw.value === w.text);
                          if (wordData) setSelectedWord(wordData);
                        }}
                      >
                        {w.text}
                      </Text>
                    ))}
                  </Group>
                }
              </Wordcloud>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500">No matching words found</p>
            </div>
          )}
        </div>
        
        {/* Word details panel */}
        {selectedWord && (
          <div className="w-full md:w-64 bg-gray-50 rounded p-4 border-l border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedWord.value}</h3>
              <button 
                onClick={() => setSelectedWord(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Frequency:</span>
                <span className="ml-2 font-medium">{selectedWord.count}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Relative Frequency:</span>
                <span className="ml-2 font-medium">
                  {words.length > 0 
                    ? ((selectedWord.count / maxCount) * 100).toFixed(2) + '%'
                    : 'N/A'
                  }
                </span>
              </div>
              
              <div>
                <span className="text-gray-600">Rank:</span>
                <span className="ml-2 font-medium">
                  {words
                    .sort((a, b) => b.count - a.count)
                    .findIndex(w => w.value === selectedWord.value) + 1}
                </span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <button 
                  onClick={() => setSearchTerm(selectedWord.value)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
                >
                  Filter to this word
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Word frequency summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        Showing {filteredWords.length} of {words.length} words. 
        {filteredWords.length > 0 && (
          <span> Frequency range: {Math.min(...filteredWords.map(w => w.count))} to {Math.max(...filteredWords.map(w => w.count))}</span>
        )}
      </div>
    </div>
  );
};

export default TagCloud; 