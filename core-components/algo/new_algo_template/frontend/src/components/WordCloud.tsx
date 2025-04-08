'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import debounce from 'lodash/debounce';

interface WordData {
  value: string;
  count: number;
}

interface CloudWord {
  text: string;
  size: number;
  x?: number;
  y?: number;
  rotate?: number;
  font?: string;
  originalData?: WordData;
}

interface Word {
  text: string;
  size: number;
  originalData?: WordData;
}

const TRANSITION_DURATION = 750;
const DEBOUNCE_DELAY = 300;

const WordCloud = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [words, setWords] = useState<WordData[]>([]);
  const [filteredWords, setFilteredWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const selectedWordRef = useRef<WordData | null>(null);
  const [minFrequency, setMinFrequency] = useState(0);
  const [maxWords, setMaxWords] = useState(100);
  const [colorSelection, setColorSelection] = useState('random');
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const previousWordsRef = useRef<CloudWord[]>([]);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const isPanelVisibleRef = useRef(false);
  const windowDimensionsRef = useRef<{width: number, height: number}>({width: 0, height: 0});
  // Store dimensions in a ref to avoid unnecessary rerenders
  const dimensionsRef = useRef({
    width: dimensions.width,
    height: dimensions.height,
    lastUpdate: 0
  });

  // Color schemes
  const customColors = [
    '#ff6b6b', '#4ecdc4', '#1a535c', '#ffe66d', '#ff9f1c',
    '#6a0572', '#ab83a1', '#1a936f', '#114b5f', '#88d498'
  ];

  // Use a ref to store random color assignments for consistency
  const wordColorsRef = useRef<Record<string, string>>({});

  const getWordColor = useCallback((d: CloudWord) => {
    // For random colors, ensure consistency by storing in ref
    if (colorSelection === 'random') {
      if (!wordColorsRef.current[d.text]) {
        wordColorsRef.current[d.text] = customColors[
          Math.floor(Math.random() * customColors.length)
        ];
      }
      return wordColorsRef.current[d.text];
    }

    const maxCount = Math.max(...filteredWords.map(w => w.count));
    const ratio = (d.originalData?.count || 0) / maxCount;

    switch (colorSelection) {
      case 'monochrome':
        return `rgba(0, 0, 255, ${0.3 + ratio * 0.7})`;
      case 'category':
        if (ratio > 0.8) return '#d00000';
        if (ratio > 0.6) return '#03045e';
        if (ratio > 0.4) return '#0077b6';
        if (ratio > 0.2) return '#00b4d8';
        return '#90e0ef';
      default:
        return wordColorsRef.current[d.text] || '#333333';
    }
  }, [colorSelection, filteredWords]); // We need filteredWords for the max count

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
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

  // Filter words
  useEffect(() => {
    let filtered = [...words];
    
    if (searchTerm) {
      filtered = filtered.filter(word => 
        word.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered = filtered
      .filter(word => word.count >= minFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, maxWords);
    
    setFilteredWords(filtered);
  }, [words, searchTerm, minFrequency, maxWords]);

  // Create word cloud layout
  const createWordCloudLayout = useCallback((words: WordData[]): Promise<CloudWord[]> => {
    return new Promise((resolve) => {
      const fontScale = d3.scaleLog()
        .domain([
          Math.min(...words.map(w => w.count)),
          Math.max(...words.map(w => w.count))
        ])
        .range([12, 50]);

      const layout = cloud<Word>()
        .size([dimensions.width, dimensions.height])
        .words(words.map(w => ({
          text: w.value,
          size: fontScale(w.count),
          originalData: w
        })))
        .padding(3)
        .rotate((d: Word) => {
          // only use 90-degree multiples for rotation (0, 90, 270)
          // long words (more than 5 characters) always display horizontally (0 degrees)
          if (d.text.length > 5) return 0;
          
          // for short words, randomly select one of the 90-degree multiples
          const rotations = [0, 90, 270];
          return rotations[Math.floor(Math.random() * rotations.length)];
        })
        .font('Inter')
        .fontSize((d: Word) => d.size);

      layout.on('end', resolve);
      layout.start();
    });
  }, [dimensions]);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce(async (words: WordData[]) => {
      if (!svgRef.current) return;

      // Don't update if we're not visible
      if (svgRef.current.closest('div')?.offsetParent === null) return;

      setIsUpdating(true);
      const cloudWords = await createWordCloudLayout(words);
      const svg = d3.select(svgRef.current);

      // Update words group - need to access words-group inside words-container
      const wordsContainer = svg.select('.words-container');
      if (wordsContainer.empty()) return;
      
      const wordsGroup = wordsContainer.select('.words-group');
      if (wordsGroup.empty()) return;

      // Update existing words and add new ones
      const wordElements = wordsGroup
        .selectAll<SVGTextElement, CloudWord>('text')
        .data(cloudWords, d => d.text);

      // Remove words that are no longer present with fade out
      wordElements.exit()
        .transition()
        .duration(TRANSITION_DURATION / 2)
        .style('opacity', 0)
        .remove();

      // Add new words
      const enterWords = wordElements.enter()
        .append('text')
        .style('opacity', 0)
        .style('font-family', 'Inter')
        .style('cursor', 'pointer')
        .attr('text-anchor', 'middle')
        .text(d => d.text)
        .attr('class', 'cloud-word'); // Add class for styling

      // Single transition for all words
      wordElements.merge(enterWords)
        .style('fill', getWordColor)
        .transition()
        .duration(TRANSITION_DURATION)
        .style('opacity', 1)
        .style('font-size', d => `${d.size}px`)
        .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`);

      // Add interaction handlers
      wordElements.merge(enterWords)
        .on('click', (event, d) => {
          if (d.originalData) {
            handleWordSelect(d.originalData);
          }
        })
        .on('mouseover', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 0.7);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 1);
        });

      // Ensure words are centered in the SVG
      const svgWidth = parseInt(svg.style('width'));
      const svgHeight = parseInt(svg.style('height'));
      wordsGroup.attr('transform', `translate(${svgWidth/2},${svgHeight/2})`);

      setIsUpdating(false);
      
      // Reset zoom to identity transform
      if (zoomRef.current && typeof window !== 'undefined') {
        // Small delay to ensure words are properly positioned
        setTimeout(() => {
          svg.call(zoomRef.current!.transform, d3.zoomIdentity);
        }, 100);
      }
    }, DEBOUNCE_DELAY),
    [createWordCloudLayout, getWordColor] // Add getWordColor as a dependency
  );

  // Update word cloud when filtered words change
  useEffect(() => {
    if (!isLoading && filteredWords.length > 0) {
      debouncedUpdate(filteredWords);
    }
  }, [filteredWords, isLoading, debouncedUpdate]);

  // Initialize client-side only variables
  useEffect(() => {
    // Set window dimensions on client side
    windowDimensionsRef.current = { 
      width: window.innerWidth, 
      height: window.innerHeight 
    };
    
    dimensionsRef.current = {
      width: dimensions.width,
      height: dimensions.height,
      lastUpdate: Date.now()
    };
  }, [dimensions]);

  // Update dimensions only when window size changes
  useEffect(() => {
    const handleResize = debounce(() => {
      const container = svgRef.current?.parentElement;
      if (!container) return;
      
        const containerWidth = container.clientWidth;
      const effectiveWidth = isPanelVisibleRef.current ? containerWidth - 256 - 16 : containerWidth;
      
      const newWidth = Math.max(effectiveWidth - 32, 400);
      const newHeight = Math.min(500, window.innerHeight * 0.6);

      // Update window dimensions ref
      windowDimensionsRef.current = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      // Only update dimensions if:
      // 1. They actually changed significantly
      // 2. It's been at least 300ms since the last update
      const now = Date.now();
      const significant = 
        Math.abs(newWidth - dimensionsRef.current.width) > 5 ||
        Math.abs(newHeight - dimensionsRef.current.height) > 5;
      const timeElapsed = now - dimensionsRef.current.lastUpdate > 300;
      
      if (significant && timeElapsed) {
        dimensionsRef.current = {
          width: newWidth,
          height: newHeight,
          lastUpdate: now
        };
        
        setDimensions({
          width: newWidth,
          height: newHeight
        });
      }
    }, 250);

    // Only add resize listener on client side
    if (typeof window !== 'undefined') {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    }
  }, []); // Empty dependency array - only run on mount

  // Initialize SVG with responsive container - only run on mount or when dimensions actually change
  const svgInitializedRef = useRef(false);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Avoid repeated initialization of SVG structure when not needed
    if (svgInitializedRef.current && 
        // Only reinitialize if dimensions actually changed significantly
        Math.abs(dimensions.width - svgRef.current.width.baseVal.value) < 5 &&
        Math.abs(dimensions.height - svgRef.current.height.baseVal.value) < 5) {
      return;
    }
    
    svgInitializedRef.current = true;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Add gradient background
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'cloud-background')
      .attr('gradientTransform', 'rotate(45)');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f8f9fa');
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#e9ecef');

    // Add background rect
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#cloud-background)')
      .attr('class', 'zoom-background'); // Add class for zoom target

    // Add group for words with responsive centering - using g.words-container > g.words-group structure
    // Container handles zoom transform, words-group handles initial centering
    const wordsContainer = svg.append('g')
      .attr('class', 'words-container');
      
    const wordsGroup = wordsContainer.append('g')
      .attr('class', 'words-group');

    // Calculate initial transform to center
    const width = parseInt(svg.style('width'));
    const height = parseInt(svg.style('height'));
    
    // Set initial translation for words group to center of svg
    wordsGroup.attr('transform', `translate(${width/2},${height/2})`);

    // Add zoom behavior
    if (typeof window !== 'undefined') {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 5]) // Allow more zoom range: 0.3x to 5x
        .on('zoom', (event) => {
          wordsContainer.attr('transform', event.transform);
          
          // Update cursor based on scale
          if (event.transform.k > 1.5) {
            svg.style('cursor', 'move');
          } else {
            svg.style('cursor', 'grab');
          }
        });
      
      // Store zoom behavior in ref for external control
      zoomRef.current = zoom;
      
      // Add zoom behavior to SVG
      svg.call(zoom)
        .on('dblclick.zoom', null) // Disable double-click zoom
        .style('cursor', 'grab')
        .on('mousedown', function() {
          d3.select(this).style('cursor', 'grabbing');
        })
        .on('mouseup', function() {
          d3.select(this).style('cursor', 'grab');
        });
    
      // Add zoom controls with tooltips for better UX
      const zoomControls = svg.append('g')
        .attr('class', 'zoom-controls')
        .attr('transform', `translate(20, ${height - 130})`);  // Moved up for more bottom margin
      
      // Add transparent background to controls with shadow effect - more transparent
      zoomControls.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 40)
        .attr('height', 120)  // Adjusted height for better spacing
        .attr('rx', 6)
        .attr('fill', 'rgba(255, 255, 255, 0.7)')  // More transparent
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .attr('filter', 'drop-shadow(0px 2px 3px rgba(0,0,0,0.15))');  // Lighter shadow
      
      // Helper function for button hover effect
      const setupButtonHover = (button: d3.Selection<SVGCircleElement, unknown, null, undefined>) => {
        button
          .on('mouseover', function() {
            d3.select(this)
              .transition()
              .duration(150)
              .attr('stroke', '#666')
              .attr('fill', '#f8f8f8');
          })
          .on('mouseout', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('stroke', '#aaa')
              .attr('fill', '#ffffff80');  // Semi-transparent white
          })
          .on('mousedown', function() {
            d3.select(this)
              .attr('fill', '#e8e8e8');
          })
          .on('mouseup', function() {
            d3.select(this)
              .attr('fill', '#f8f8f8');
          });
      };
      
      // Calculate even spacing between buttons
      const buttonSpacing = 35; // Increased spacing
      const topPadding = 25; // Padding from top of panel
      
      // Zoom in button (top)
      const zoomInButton = zoomControls.append('circle')
        .attr('cx', 20)
        .attr('cy', topPadding)
        .attr('r', 14)
        .attr('fill', '#ffffff80')  // Semi-transparent white
        .attr('stroke', '#aaa')
        .attr('stroke-width', 1)
        .attr('cursor', 'pointer')
        .attr('title', 'Zoom In')
        .on('click', () => {
          if (zoomRef.current) {
            svg.transition().duration(300).call(
              zoomRef.current.scaleBy, 1.3
            );
          }
        });
      
      setupButtonHover(zoomInButton);
      
      // Ensure "+" is perfectly centered by using a viewport
      const plusIcon = zoomControls.append('g')
        .attr('transform', `translate(20, ${topPadding})`)  // Centered
        .attr('pointer-events', 'none');
        
      plusIcon.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')  // This properly centers text vertically
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('fill', '#555')
        .text('+');
      
      // Zoom out button (middle)
      const zoomOutButton = zoomControls.append('circle')
        .attr('cx', 20)
        .attr('cy', topPadding + buttonSpacing)
        .attr('r', 14)
        .attr('fill', '#ffffff80')  // Semi-transparent white
        .attr('stroke', '#aaa')
        .attr('stroke-width', 1)
        .attr('cursor', 'pointer')
        .attr('title', 'Zoom Out')
        .on('click', () => {
          if (zoomRef.current) {
            svg.transition().duration(300).call(
              zoomRef.current.scaleBy, 0.7
            );
          }
        });
        
      setupButtonHover(zoomOutButton);
      
      // Ensure "-" is perfectly centered by using a viewport
      const minusIcon = zoomControls.append('g')
        .attr('transform', `translate(20, ${topPadding + buttonSpacing})`)  // Centered
        .attr('pointer-events', 'none');
        
      minusIcon.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')  // This properly centers text vertically
        .attr('font-size', '24px')
        .attr('font-weight', 'bold')
        .attr('fill', '#555')
        .text('−');
        
      // Reset zoom button (bottom) with home icon
      const resetButton = zoomControls.append('circle')
        .attr('cx', 20)
        .attr('cy', topPadding + buttonSpacing * 2)
        .attr('r', 14)
        .attr('fill', '#ffffff80')  // Semi-transparent white
        .attr('stroke', '#aaa')
        .attr('stroke-width', 1)
        .attr('cursor', 'pointer')
        .attr('title', 'Reset View')
        .on('click', () => {
          if (zoomRef.current) {
            // Reset to identity transform
            svg.transition().duration(300).call(
              zoomRef.current.transform, d3.zoomIdentity
            );
          }
        });
      
      setupButtonHover(resetButton);
      
      // Home icon (simplified) for reset - improved centering
      const resetIcon = zoomControls.append('g')
        .attr('transform', `translate(20, ${topPadding + buttonSpacing * 2})`)  // Centered
        .attr('pointer-events', 'none');
        
      // Draw a simple house shape - centered
      resetIcon.append('path')
        .attr('d', 'M-6,-4 L0,-8 L6,-4 L6,4 L2,4 L2,0 L-2,0 L-2,4 L-6,4 Z')
        .attr('fill', '#555')
        .attr('stroke', '#555')
        .attr('stroke-width', 0.5);
    }

    // Add resize observer for responsive centering
    const resizeObserver = new ResizeObserver(() => {
      // Update the words group transform for centering
      const svgWidth = parseInt(svg.style('width'));
      const svgHeight = parseInt(svg.style('height'));
      wordsGroup.attr('transform', `translate(${svgWidth/2},${svgHeight/2})`);
      
      // Update zoom controls position to stay at left bottom with the adjusted margin
      svg.select('.zoom-controls')
        .attr('transform', `translate(20, ${svgHeight - 130})`);
    });
    
    if (svgRef.current) {
    resizeObserver.observe(svgRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [dimensions]);

  // Add a function to reset zoom when search/filter changes
  useEffect(() => {
    // Reset zoom when filtered words change (search, filter, etc.)
    if (zoomRef.current && svgRef.current && typeof window !== 'undefined') {
      // Reset to identity transform (no translation/scaling)
      const svg = d3.select(svgRef.current);
      
      // Small delay to ensure words are rendered before transform
      setTimeout(() => {
        svg.transition().duration(300).call(
          zoomRef.current!.transform, d3.zoomIdentity
        );
      }, 50);
    }
  }, [filteredWords]);

  const minCount = words.length > 0 ? Math.min(...words.map(w => w.count)) : 0;
  const maxCount = words.length > 0 ? Math.max(...words.map(w => w.count)) : 100;
  
  // Handle word selection
  const handleWordSelect = (word: WordData) => {
    // Store selected word in ref to avoid unnecessary re-renders
    selectedWordRef.current = word;
    
    // Only update panel visibility if it's changing
    if (!isPanelVisibleRef.current) {
      isPanelVisibleRef.current = true;
      setIsPanelVisible(true);
      
      // Use timeout to ensure panel visibility change is processed first
      setTimeout(() => {
        setSelectedWord(word);
      }, 50);
    } else {
      // Just update the selected word without triggering layout recalculation
      setSelectedWord(word);
    }
  };

  // Handle panel close
  const handlePanelClose = () => {
    selectedWordRef.current = null;
    isPanelVisibleRef.current = false;
    setSelectedWord(null);
    setIsPanelVisible(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full overflow-hidden">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Word Cloud</h2>
      
      {/* Controls */}
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
        {/* Word cloud visualization with minimum width */}
        <div className="flex-1 h-[500px] bg-gray-50 rounded flex items-center justify-center p-4 overflow-hidden relative wordcloud-container"
             style={{ minWidth: selectedWord ? '400px' : 'auto' }}>
          {(isLoading || isUpdating) && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-500">{isLoading ? 'Loading...' : 'Updating...'}</span>
            </div>
            </div>
          )}
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              minWidth: selectedWord ? '400px' : 'auto',
              cursor: 'grab'
            }}
            className={isUpdating ? 'opacity-50' : 'opacity-100'}
          />
          <style jsx>{`
            .wordcloud-container svg:active {
              cursor: grabbing;
            }
            .cloud-word {
              user-select: none;
            }
          `}</style>
        </div>
        
        {/* Word details panel */}
        {selectedWord && (
          <div className="w-full md:w-64 bg-gray-50 rounded p-4 border-l border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedWord.value}</h3>
              <button 
                onClick={handlePanelClose}
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
                  {((selectedWord.count / maxCount) * 100).toFixed(2)}%
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

export default WordCloud; 