'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useDataStore } from '@/store/dataStore';

interface SentimentData {
  name: string;
  values: [string, number][];
}

interface DateRange {
  start: Date;
  end: Date;
}

interface FormattedDataPoint {
  date: Date;
  value: number;
}

interface FormattedSeries {
  name: string;
  values: FormattedDataPoint[];
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

interface SentimentChartProps {
  skipLoading?: boolean;
}

const SentimentChartV2 = ({ skipLoading = false }: SentimentChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [loading, setLoading] = useState(true);
  const tooltipRef = useRef<d3.Selection<HTMLDivElement, unknown, null, undefined> | null>(null);
  const verticalLineRef = useRef<d3.Selection<SVGLineElement, unknown, null, undefined> | null>(null);

  // Get data fetching function from store
  const { fetchSentimentData } = useDataStore();

  // Memoize parseTime function to avoid recreating it
  const parseTime = useCallback(d3.timeParse('%Y-%m-%dT%H:%M:%SZ'), []);
  const formatDate = useCallback(d3.timeFormat('%b %d, %Y'), []);

  // Fetch data only once on initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use the data store function instead of direct fetch
        const data: SentimentData[] = await fetchSentimentData();

        // Sort data by sentiment value from -2 to +2 (ascending order)
        data.sort((a, b) => {
          const aNum = parseInt(a.name.replace('+', ''));
          const bNum = parseInt(b.name.replace('+', ''));
          return aNum - bNum;
        });

        setSentimentData(data);

        // Initialize with full date range
        const allDates = data.flatMap(d =>
          d.values.map(v => parseTime(v[0]))
        ).filter((d): d is Date => d !== null);

        if (allDates.length > 0) {
          const extent = d3.extent(allDates) as [Date, Date];
          setDateRange({ start: extent[0], end: extent[1] });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading sentiment data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [parseTime, fetchSentimentData]);

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

  // Render chart whenever data, date range or size changes
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
  }, [sentimentData, dateRange, chartWidth, parseTime, formatDate]);

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case '-2': return '#4fc3f7'; // Vivid blue for very negative
      case '-1': return '#9575cd'; // Purple for slightly negative
      case '0': return '#e0e0e0';  // Light gray for neutral
      case '+1': return '#ffb74d'; // Amber for slightly positive
      case '+2': return '#ff8a65'; // Coral/orange for very positive
      default: return '#e0e0e0';
    }
  };

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
        .style('transition', 'left 0.15s ease-out, top 0.15s ease-out'); // Smooth position transitions
    }

    container.selectAll('svg').remove();

    // Set dimensions
    const margin = { top: 40, right: 40, bottom: 40, left: 50 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const chartCount = sentimentData.length;
    const chartHeight = 70; // Slightly smaller height for each small chart to match the image
    const spacing = 15;     // Less spacing between charts to match the compact look
    const totalHeight = (chartHeight * chartCount) + (spacing * (chartCount - 1)) + margin.top + margin.bottom;

    // Only proceed if we have valid dimensions
    if (width <= 0) return;

    // Create SVG with a clipping path for smooth transitions
    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', totalHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // // Add title with smaller font and different position
    // svg.append('text')
    //   .attr('x', width / 2)
    //   .attr('y', -margin.top / 2)
    //   .attr('text-anchor', 'middle')
    //   .attr('class', 'text-md font-medium')
    //   .text('Sentiment Categories');

    // Format the data
    const formattedData: FormattedSeries[] = sentimentData.map(d => ({
      name: d.name,
      values: d.values
        .map(v => {
          const date = parseTime(v[0]);
          return {
            date: date!, // Non-null assertion (we'll filter invalid dates below)
            value: v[1]
          };
        })
        .filter(point => point.date !== null && point.date >= dateRange.start && point.date <= dateRange.end)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
    }));

    // Apply data decimation based on available width
    const maxPointsPerLine = Math.max(100, Math.floor(width / 3));
    const decimatedData = formattedData.map(series => ({
      name: series.name,
      values: decimateData(series.values, maxPointsPerLine)
    }));

    if (decimatedData.length === 0 || decimatedData.every(d => d.values.length === 0)) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', totalHeight / 2)
        .attr('text-anchor', 'middle')
        .text('No data points in the selected date range');
      return;
    }

    // Global scales
    const x = d3.scaleTime()
      .domain([dateRange.start, dateRange.end])
      .range([0, width]);

    // Draw each chart
    decimatedData.forEach((series, i) => {
      const yPos = i * (chartHeight + spacing);

      // Find max value for this series
      const maxValue = d3.max(series.values, d => d.value) || 1;

      // Local y scale for this chart
      const y = d3.scaleLinear()
        .domain([0, maxValue * 1.1]) // Add 10% padding
        .range([chartHeight, 0])
        .nice();

      // Create a clipping path for this chart
      svg.append('defs')
        .append('clipPath')
        .attr('id', `clip-${i}`)
        .append('rect')
        .attr('width', width)
        .attr('height', chartHeight);

      // Create a group for this chart
      const chartGroup = svg.append('g')
        .attr('transform', `translate(0,${yPos})`)
        .attr('clip-path', `url(#clip-${i})`);

      // Add border for this chart
      svg.append('rect')
        .attr('x', 0)
        .attr('y', yPos)
        .attr('width', width)
        .attr('height', chartHeight)
        .style('fill', 'none')
        .style('stroke', '#eaeaea') // Lighter gray border
        .style('stroke-width', 0.25); // Thinner border

      // Add Y axis label (sentiment value) with enhanced visibility
      svg.append('text')
        .attr('x', -15)
        .attr('y', yPos + chartHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'text-xs font-medium')
        .style('fill', getSentimentColor(String(series.name)))
        .text(series.name);

      // Add indicator label to suggest sentiment meaning
      const sentimentLabel = () => {
        switch(series.name) {
          case '-2': return 'Very Negative';
          case '-1': return 'Negative';
          case '0': return 'Neutral';
          case '1':
          case '+1': return 'Positive';
          case '2':
          case '+2': return 'Very Positive';
          default: return '';
        }
      };

      // Add the sentiment meaning label at the top of each chart
      svg.append('text')
        .attr('x', 10)
        .attr('y', yPos + 15) // Position near the top of each chart
        .attr('class', 'text-xs')
        .style('opacity', 0.7)
        .style('fill', getSentimentColor(String(series.name)))
        .text(sentimentLabel());

      // Create gradient for this chart
      const gradientId = `gradient-${i}`;
      const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', getSentimentColor(String(series.name)))
        .attr('stop-opacity', 0.95);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', getSentimentColor(String(series.name)))
        .attr('stop-opacity', 0.6);

      // Generate the area
      const area = d3.area<FormattedDataPoint>()
        .x(d => x(d.date))
        .y0(chartHeight) // Baseline
        .y1(d => y(d.value))
        .curve(d3.curveBasis) // Smoother curve that matches the image
        .defined(d => !isNaN(d.value)); // Skip undefined or NaN values

      // Add the area
      chartGroup.append('path')
        .datum(series.values)
        .attr('class', 'area')
        .attr('d', area)
        .style('fill', `url(#${gradientId})`)
        .style('opacity', 0.9)
        .style('stroke', 'none');

      // Add a thin baseline
      chartGroup.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', chartHeight)
        .attr('y2', chartHeight)
        .style('stroke', '#ddd')
        .style('stroke-width', 0.5);
    });

    // Add X axis at the bottom
    svg.append('g')
      .attr('transform', `translate(0,${chartCount * (chartHeight + spacing) - spacing})`)
      .call(
        d3.axisBottom(x)
          .ticks(width > 600 ? 6 : 4) // Fewer ticks to match the image
          .tickSize(5)
          .tickFormat(d3.timeFormat('%Y') as any) // Just show years to match the image
      )
      .attr('class', 'text-xs')
      .call(g => g.select('.domain').attr('stroke-width', 0.5)) // Thinner axis line
      .call(g => g.selectAll('.tick line').attr('stroke-width', 0.5)); // Thinner tick marks

    // Add more specific labels for months - create more evenly spaced labels
    // Calculate appropriate number of month labels based on width
    const monthsPerYear = width > 800 ? 4 : width > 600 ? 3 : 2;
    const startYear = dateRange.start.getFullYear();
    const endYear = dateRange.end.getFullYear();

    const timeLabels: Date[] = [];

    // Generate month labels for each year in the range
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month += 12/monthsPerYear) {
        const labelDate = new Date(year, month, 1);
        if (labelDate >= dateRange.start && labelDate <= dateRange.end) {
          timeLabels.push(labelDate);
        }
      }
    }

    timeLabels.forEach(date => {
      svg.append('text')
        .attr('x', x(date))
        .attr('y', chartCount * (chartHeight + spacing) - spacing + 25)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-xs text-gray-500')
        .text(d3.timeFormat('%b')(date));
    });

    // Add a shared vertical line for tooltips
    const verticalLine = svg.append('line')
      .attr('class', 'vertical-line')
      .style('stroke', '#999')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0)
      .attr('y1', 0)
      .attr('y2', chartCount * (chartHeight + spacing) - spacing);

    verticalLineRef.current = verticalLine;

    // Create a rect to capture mouse events
    const mouseArea = svg.append('rect')
      .attr('width', width)
      .attr('height', chartCount * (chartHeight + spacing) - spacing)
      .style('fill', 'none')
      .style('pointer-events', 'all');

    // Prepare data for hover interactions - create a lookup table by date
    const dateValues = new Map<number, Map<string, number>>();

    decimatedData.forEach(series => {
      series.values.forEach(point => {
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
          .attr('x2', x(selectedDate));

        // Build tooltip content with more minimal styling
        let tooltipContent = `<div class="font-medium text-xs mb-1" style="color:#555;">${formatDate(selectedDate)}</div>`;

        // Add values for each sentiment category with minimal styling
        tooltipContent += `<div class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">`;

        decimatedData.forEach(series => {
          const seriesValues = dateValues.get(selectedTimestamp);
          const value = seriesValues?.get(series.name) ?? 0;

          tooltipContent += `
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-1" style="background-color: ${getSentimentColor(String(series.name))};"></span>
              <span style="color:#555;">Sentiment ${series.name}</span>
            </div>
            <div class="font-medium text-right">${value}</div>
          `;
        });

        tooltipContent += `</div>`;

        // Position and populate the tooltip
        if (tooltipRef.current) {
          // First, update the content
          tooltipRef.current.html(tooltipContent);

          // Get the tooltip dimensions
          const tooltipNode = tooltipRef.current.node();
          const tooltipWidth = tooltipNode ? tooltipNode.getBoundingClientRect().width : 200;

          // Get the chart container dimensions
          const chartContainer = d3.select(chartRef.current).node();
          const containerWidth = chartContainer ? chartContainer.getBoundingClientRect().width : 0;

          // Check if there's enough space on the right
          const spaceOnRight = containerWidth - event.offsetX;
          const tooltipX = spaceOnRight < (tooltipWidth + 20) ?
            `${event.offsetX - tooltipWidth - 10}px` : // Position to the left of the cursor
            `${event.offsetX + 15}px`;                 // Position to the right of the cursor

          // Update the position
          tooltipRef.current
            .style('left', tooltipX)
            .style('top', `${event.offsetY - 28}px`);
        }
      })
      .on('mouseout', () => {
        if (tooltipRef.current) tooltipRef.current.style('visibility', 'hidden');
        verticalLine.style('opacity', 0);
      });
  };

  // Render the brush component (date range selector)
  const renderBrush = () => {
    if (!brushRef.current || !dateRange) return;

    const container = d3.select(brushRef.current);
    container.selectAll('svg').remove();

    // Match margin settings to the main chart for consistent width
    const margin = { top: 10, right: 40, bottom: 20, left: 50 };
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

    // Add mini charts for each series to the brush area
    overviewData.forEach((series) => {
      if (series.values.length > 0) {
        // Create area generator for the mini chart
        const area = d3.area<{date: Date, value: number}>()
          .x(d => x(d.date))
          .y0(height) // Baseline at bottom
          .y1(d => y(d.value))
          .curve(d3.curveCatmullRom.alpha(0.5));

        // Add filled area with transparency
        svg.append('path')
          .datum(series.values)
          .attr('class', 'mini-area')
          .attr('d', area as any)
          .style('fill', getSentimentColor(String(series.name)))
          .style('fill-opacity', 0.3)
          .style('stroke', getSentimentColor(String(series.name)))
          .style('stroke-width', 0.75)
          .style('stroke-opacity', 0.8);
      }
    });

    // Add X axis to the brush with improved month/year format
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(5)
        .tickSize(-height)
        .tickFormat(d3.timeFormat('%b %Y') as any))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', '#ccc')
        .attr('stroke-dasharray', '2,2'))
      .call(g => g.selectAll('.tick text') // Make sure tick labels don't overlap
        .style('text-anchor', 'middle')
        .attr('dy', '1em'));

    // Create brush component
    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on('brush', (event) => {
        // Handle brush movement in real-time for smoother feedback
        if (!event.sourceEvent || !event.selection) return;

        // Update the brush area visually (don't redraw the main chart for performance)
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
      .style('right', '40px')  // Match the right margin
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

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 border-b pb-2">Sentiment Analysis by Category</h2>

      {loading && !skipLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-gray-500">Loading sentiment data...</p>
        </div>
      ) : (
        <>
          <div ref={chartRef} className="w-full relative"></div>

          <div className="text-xs text-gray-500 mt-4 mb-1 ml-1">
            Drag to select date range:
          </div>

          <div ref={brushRef} className="w-full h-[65px] relative mt-2"></div>
        </>
      )}
    </div>
  );
};

export default SentimentChartV2;