'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import ChartSkeleton from './ChartSkeleton';
import ChartError from './ChartError';

interface SentimentData {
  name: string;
  values: [string, number][];
}

interface VisibleLines {
  [key: string]: boolean;
}

interface FormattedDataPoint {
  date: Date | null;
  value: number;
}

interface FormattedSeries {
  name: string;
  values: FormattedDataPoint[];
}

interface DateRange {
  start: Date;
  end: Date;
}

// Utility function to decimate data points
const decimateData = (data: FormattedDataPoint[], maxPoints: number): FormattedDataPoint[] => {
  if (data.length <= maxPoints) return data;
  
  // Use LTTB (Largest-Triangle-Three-Buckets) algorithm for data decimation
  const bucketSize = Math.floor(data.length / maxPoints);
  const decimated: FormattedDataPoint[] = [];
  
  // Always keep the first point
  decimated.push(data[0]);
  
  for (let i = 1; i < maxPoints - 1; i++) {
    const bucketStart = Math.floor((i * data.length) / maxPoints);
    const bucketEnd = Math.floor(((i + 1) * data.length) / maxPoints);
    
    // Find point with max value in bucket
    let maxPoint = data[bucketStart];
    let maxValue = data[bucketStart].value;
    
    for (let j = bucketStart; j < bucketEnd; j++) {
      if (data[j].value > maxValue) {
        maxValue = data[j].value;
        maxPoint = data[j];
      }
    }
    
    decimated.push(maxPoint);
  }
  
  // Always keep the last point
  decimated.push(data[data.length - 1]);
  
  return decimated;
};

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const SentimentChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [visibleLines, setVisibleLines] = useState<VisibleLines>({});
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevFormattedDataRef = useRef<FormattedSeries[]>([]);
  const tooltipRef = useRef<d3.Selection<HTMLDivElement, unknown, null, undefined> | null>(null);

  // Memoize parseTime function to avoid recreating it
  const parseTime = useCallback(d3.timeParse('%Y-%m-%dT%H:%M:%SZ'), []);
  const formatDate = useCallback(d3.timeFormat('%b %d, %Y'), []);

  // Fetch data with retry functionality
  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5001/api/data/sentiment');
      
      if (response.status === 503) {
        throw new Error('Data is being processed. Please try again in a moment.');
      }
      if (!response.ok) {
        throw new Error(`Failed to load sentiment data: ${response.statusText}`);
      }

      const data = await response.json() as SentimentData[];
      setSentimentData(data);
      
      // Initialize all lines as visible
      const initialVisibility: VisibleLines = {};
      data.forEach(line => {
        initialVisibility[line.name] = true;
      });
      setVisibleLines(initialVisibility);
      
      // Initialize with full date range
      const allDates = data.flatMap(d => 
        d.values.map(v => parseTime(v[0]))
      ).filter((d): d is Date => d !== null);
      
      if (allDates.length > 0) {
        const extent = d3.extent(allDates);
        if (extent[0] && extent[1]) {
          setDateRange({ start: extent[0], end: extent[1] });
        }
      }
    } catch (error) {
      console.error('Error loading sentiment data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [parseTime]);

  // Initialize data
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Handle resize with debouncing
  useEffect(() => {
    if (!chartRef.current) return;

    // Get initial dimensions
    setChartWidth(chartRef.current.clientWidth);

    // Debounced resize handler
    const handleResize = debounce(() => {
      if (chartRef.current) {
        setChartWidth(chartRef.current.clientWidth);
      }
    }, 150); // 150ms debounce

    // Only add resize handler on the client
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Render chart whenever data, visibility, date range or size changes
  useEffect(() => {
    if (!chartRef.current || !sentimentData.length || !dateRange) return;
    
    renderChart();
    renderBrush();

    // Clean up tooltip when component unmounts
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, [sentimentData, visibleLines, dateRange, chartWidth, parseTime, formatDate]);

  const renderChart = () => {
    if (!chartRef.current || !dateRange) return;
      
    const container = d3.select(chartRef.current);
    
    // Create tooltip only once
    if (!tooltipRef.current) {
      tooltipRef.current = container.append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'rgba(255, 255, 255, 0.9)')
        .style('border', '1px solid #ddd')
        .style('border-radius', '4px')
        .style('padding', '8px')
        .style('box-shadow', '2px 2px 6px rgba(0, 0, 0, 0.2)')
        .style('pointer-events', 'none')
        .style('font-size', '12px')
        .style('z-index', '10')
        .style('transition', 'transform 0.1s ease-out'); // Smooth tooltip movement
    }
    
    container.selectAll('svg').remove();

    // Set dimensions
    const margin = { top: 20, right: 80, bottom: 30, left: 50 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Only proceed if we have valid dimensions
    if (width <= 0) return;

    // Create SVG with a clipping path for smooth transitions
    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    // Add clipping path
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    // Format the data
    let formattedData: FormattedSeries[] = sentimentData
      .filter(d => visibleLines[d.name]) // Only include visible lines
      .map(d => ({
        name: d.name,
        values: d.values
          .map(v => ({
          date: parseTime(v[0]),
          value: v[1]
        }))
          // Filter data points within the selected date range
          .filter(point => {
            if (!point.date) return false;
            return point.date >= dateRange.start && point.date <= dateRange.end;
          })
          .sort((a, b) => {
            if (!a.date || !b.date) return 0;
            return a.date.getTime() - b.date.getTime();
          })
      }));

    // Apply data decimation based on available width
    const maxPointsPerLine = Math.max(100, Math.floor(width / 3)); // Adjust based on screen width
    formattedData = formattedData.map(series => ({
      name: series.name,
      values: decimateData(series.values, maxPointsPerLine)
    }));

    if (formattedData.length === 0 || formattedData.every(d => d.values.length === 0)) {
      // If no data points in the selected range
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('No data points in the selected date range');
      return;
    }

    // Find max value across visible series in the selected range
    const maxValue = d3.max(formattedData, d => d3.max(d.values, v => v.value)) as number;

    // Set scales
    const x = d3.scaleTime()
      .domain([dateRange.start, dateRange.end])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.05]) // Add 5% padding at the top
      .nice()
      .range([height, 0]);

    // Define line with smoother curve
    const line = d3.line<FormattedDataPoint>()
      .defined(d => d.date !== null)
      .x(d => x(d.date as Date))
      .y(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5)); // Smoother curve

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('class', 'x-axis')
      .call(
        d3.axisBottom(x)
          .ticks(width > 600 ? 10 : 5) // Responsive tick count
          .tickSizeOuter(0)
      );

    // Add Y axis
    svg.append('g')
      .attr('class', 'y-axis')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSizeOuter(0)
      );

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid-lines')
      .style('stroke', '#e5e7eb')
      .style('stroke-opacity', 0.7)
      .style('shape-rendering', 'crispEdges')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => '')
      );

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Chart group with clipping path
    const chartGroup = svg.append('g')
      .attr('clip-path', 'url(#clip)');

    // Add the lines
    chartGroup.selectAll('.line')
      .data(formattedData)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => line(d.values) as string)
      .style('stroke', (d) => color(d.name))
      .style('fill', 'none')
      .style('stroke-width', 2.5) // Slightly thicker for better visibility
      .style('opacity', 0) // Start with opacity 0
      .transition() // Animate in
      .duration(800)
      .style('opacity', 0.9); // Slightly transparent for a softer look

    // Add labels for X and Y axes
    svg.append('text')
      .attr('transform', `translate(${width/2}, ${height + margin.bottom - 5})`)
      .style('text-anchor', 'middle')
      .attr('class', 'text-xs text-gray-600')
      .text('Date');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -height / 2)
      .attr('class', 'text-xs text-gray-600')
      .style('text-anchor', 'middle')
      .text('Sentiment Value');
      
    // ======= Create the interactive elements =======
    
    // Create vertical line for hover
    const verticalLine = svg.append('line')
      .attr('class', 'vertical-line')
      .style('stroke', '#999')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0);
    
    // Create a rect to capture mouse events
    const mouseArea = svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all');
      
    // Prepare data for hover interactions by aligning dates
    // Use a more efficient method to create a lookup table
    const dateValues = new Map<number, Map<string, number>>();
    
    formattedData.forEach(series => {
      series.values.forEach(point => {
        if (!point.date) return;
        
        const timestamp = point.date.getTime();
        if (!dateValues.has(timestamp)) {
          dateValues.set(timestamp, new Map<string, number>());
        }
        
        dateValues.get(timestamp)?.set(series.name, point.value);
      });
    });
    
    // Get sorted timestamps
    const sortedTimestamps = Array.from(dateValues.keys()).sort((a, b) => a - b);
      
    // Create a throttled mousemove handler for better performance
    let lastMove = 0;
    const throttleDelay = 30; // ms
    
    // Handle mouse events
    mouseArea
      .on('mouseover', () => {
        if (tooltipRef.current) tooltipRef.current.style('visibility', 'visible');
        verticalLine.style('opacity', 1);
      })
      .on('mousemove', (event) => {
        const now = Date.now();
        if (now - lastMove < throttleDelay) return;
        lastMove = now;
        
        const [mouseX] = d3.pointer(event);
        
        if (sortedTimestamps.length === 0) return;
        
        // Binary search to find closest timestamp
        const mouseDate = x.invert(mouseX).getTime();
        let left = 0;
        let right = sortedTimestamps.length - 1;
        let closestIndex = 0;
        
        while (left <= right) {
          const mid = Math.floor((left + right) / 2);
          if (Math.abs(sortedTimestamps[mid] - mouseDate) < 
              Math.abs(sortedTimestamps[closestIndex] - mouseDate)) {
            closestIndex = mid;
          }
          
          if (sortedTimestamps[mid] < mouseDate) {
            left = mid + 1;
          } else {
            right = mid - 1;
          }
        }
        
        const selectedTimestamp = sortedTimestamps[closestIndex];
        const selectedDate = new Date(selectedTimestamp);
        
        // Position the vertical line
        verticalLine
          .attr('x1', x(selectedDate))
          .attr('x2', x(selectedDate))
          .attr('y1', 0)
          .attr('y2', height);
          
        // Build tooltip content
        let tooltipContent = `<div class="font-medium mb-1">${formatDate(selectedDate)}</div>`;
        
        // Add values for each visible line
        formattedData.forEach((series) => {
          // Find the value for this date in this series
          const seriesValues = dateValues.get(selectedTimestamp);
          const value = seriesValues?.get(series.name) ?? "N/A";
          
          tooltipContent += `
            <div class="flex items-center mb-1">
              <span style="background-color: ${color(series.name)}; width: 8px; height: 8px; display: inline-block; margin-right: 4px; border-radius: 50%;"></span>
              <span class="mr-2">Sentiment ${series.name}:</span>
              <span class="font-medium">${typeof value === 'number' ? value.toFixed(2) : value}</span>
            </div>
          `;
        });
        
        // Position and populate the tooltip
        if (tooltipRef.current) {
          tooltipRef.current
            .style('left', `${event.offsetX + 15}px`)
            .style('top', `${event.offsetY - 28}px`)
            .html(tooltipContent);
        }
      })
      .on('mouseout', () => {
        if (tooltipRef.current) tooltipRef.current.style('visibility', 'hidden');
        verticalLine.style('opacity', 0);
      });
      
    // Store reference to formatted data for transitions
    prevFormattedDataRef.current = formattedData;
  };

  // Render the brush component (date range selector)
  const renderBrush = () => {
    if (!brushRef.current || !dateRange) return;
  
    const container = d3.select(brushRef.current);
    container.selectAll('svg').remove();
  
    // Set dimensions
    const margin = { top: 10, right: 80, bottom: 20, left: 50 };
    const width = brushRef.current.clientWidth - margin.left - margin.right;
    const height = 60 - margin.top - margin.bottom;
  
    // Create SVG
    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    // Get all dates for the overview
    const allDates = sentimentData.flatMap(d => 
      d.values.map(v => parseTime(v[0]))
    ).filter((d): d is Date => d !== null);
  
    // Find the full date range
    const fullDateRange = d3.extent(allDates) as [Date, Date];
  
    // Create a smaller, decimated version of the dataset for the brush component
    const overviewData = sentimentData.map(series => {
      const values = series.values
        .map(v => ({
          date: parseTime(v[0]),
          value: v[1]
        }))
        .filter((d): d is {date: Date, value: number} => d.date !== null)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
        
      // Decimate data for the mini chart
      return {
        name: series.name,
        visible: visibleLines[series.name],
        values: decimateData(values, 50) // Fewer points for mini chart
      };
    });
  
    // X scale for the brush
    const x = d3.scaleTime()
      .domain(fullDateRange)
      .range([0, width]);
  
    // Max value for Y scale
    const maxValue = d3.max(overviewData, d => d3.max(d.values, v => v.value)) || 0;
  
    // Y scale for the brush
    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.05])
      .range([height, 0]);
  
    // Line generator for the brush
    const line = d3.line<{date: Date, value: number}>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5)); // Smoother curve
  
    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);
  
    // Add mini charts for each visible series to the brush area
    overviewData.forEach((series) => {
      if (series.visible && series.values.length > 0) {
        svg.append('path')
          .datum(series.values)
          .attr('class', 'mini-line')
          .attr('d', line as any) // Use type assertion to fix the type error
          .style('stroke', color(series.name))
          .style('stroke-width', 1)
          .style('fill', 'none')
          .style('opacity', 0.7);
      }
    });
  
    // Add X axis to the brush
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-height).tickFormat(d3.timeFormat('%b %Y') as any))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', '#ccc')
        .attr('stroke-dasharray', '2,2'));
  
    // Create brush component
    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on('brush', (event) => {
        // Handle brush movement in real-time for smoother feedback
        if (!event.sourceEvent || !event.selection) return;
        
        // Update the brush area visually
        const [x0, x1] = event.selection as [number, number];
        
        // Don't update the whole chart during brushing for performance
        // This gives a smoother feel during interaction
      })
      .on('end', (event) => {
        if (!event.sourceEvent) return; // Only respond to user events
        if (!event.selection) return; // Skip if no selection
          
        const [x0, x1] = event.selection as [number, number];
        const newStart = x.invert(x0);
        const newEnd = x.invert(x1);
          
        // Update date range state
        setDateRange({ start: newStart, end: newEnd });
      });
  
    // Add the brush to the SVG
    const brushGroup = svg.append('g')
      .attr('class', 'brush')
      .call(brush);
  
    // Set initial brush position based on current date range
    if (dateRange) {
      brushGroup.call(brush.move, [x(dateRange.start), x(dateRange.end)]);
    }
  
    // Style the brush
    svg.selectAll('.selection')
      .attr('fill', '#69b3a2')
      .attr('fill-opacity', 0.3)
      .attr('stroke', '#69b3a2');
  
    // Style the brush handles
    svg.selectAll('.handle')
      .attr('fill', '#69b3a2')
      .attr('stroke', '#69b3a2')
      .attr('stroke-width', 0.5);

    // Add reset button
    const resetButton = container
      .append('button')
      .attr('class', 'reset-button')
      .style('position', 'absolute')
      .style('top', '10px')
      .style('right', '85px')
      .style('background-color', '#f3f4f6')
      .style('border', '1px solid #d1d5db')
      .style('border-radius', '4px')
      .style('padding', '2px 8px')
      .style('font-size', '10px')
      .style('cursor', 'pointer')
      .text('Reset Zoom')
      .on('click', () => {
        // Reset to full date range
        setDateRange({ start: fullDateRange[0], end: fullDateRange[1] });
      });
  };

  const toggleLineVisibility = (name: string) => {
    setVisibleLines(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const toggleAllLines = (visible: boolean) => {
    const newVisibility: VisibleLines = {};
    Object.keys(visibleLines).forEach(key => {
      newVisibility[key] = visible;
    });
    setVisibleLines(newVisibility);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 border-b pb-2">Sentiment Analysis Over Time</h2>
      
      {loading ? (
        <ChartSkeleton type="line" height={400} />
      ) : error ? (
        <ChartError 
          message={error} 
          onRetry={fetchChartData}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium mr-2">Display:</span>
            
            <button 
              onClick={() => toggleAllLines(true)}
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded-md mr-2"
            >
              Show All
            </button>
            
            <button 
              onClick={() => toggleAllLines(false)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-md"
            >
              Hide All
            </button>
            
            <div className="flex flex-wrap gap-3 mt-2">
              {sentimentData.map((sentiment, index) => (
                <label key={sentiment.name} className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleLines[sentiment.name] || false}
                    onChange={() => toggleLineVisibility(sentiment.name)}
                    className="sr-only"
                  />
                  <span 
                    className={`inline-block w-3 h-3 mr-1 rounded-sm`}
                    style={{ backgroundColor: d3.schemeCategory10[index % 10] }}
                  ></span>
                  <span 
                    className={`text-sm ${visibleLines[sentiment.name] ? 'font-medium' : 'text-gray-500'}`}
                  >
                    Sentiment {sentiment.name}
                  </span>
                  <span 
                    className={`w-6 h-3 ml-2 rounded-full ${visibleLines[sentiment.name] ? 'bg-blue-600' : 'bg-gray-300'}`}
                  ></span>
                </label>
              ))}
            </div>
          </div>
          
          <div ref={chartRef} className="w-full h-[400px] relative"></div>
          
          <div className="text-xs text-gray-500 mt-1 mb-1 ml-1">
            Drag to select date range:
          </div>
          
          <div ref={brushRef} className="w-full h-[65px] relative mt-2"></div>
        </>
      )}
    </div>
  );
};

export default SentimentChart; 