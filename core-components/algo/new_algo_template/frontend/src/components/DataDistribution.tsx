'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DataDistributionProps {
  title: string;
  description?: string;
  dataSource?: string;
}

interface DataPoint {
  time?: string | Date;
  count?: number;
  emails_per_day?: number;
}

interface FormattedDatePoint {
  time: Date | null;
  count: number;
}

const DataDistribution = ({ 
  title, 
  description, 
  dataSource 
}: DataDistributionProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine which data file to use based on the title
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let source = dataSource;
        
        // If no explicit source is provided, infer from title
        if (!source) {
          if (title.toLowerCase().includes('date')) {
            source = '/data/date_distribution_data.csv';
          } else if (title.toLowerCase().includes('email counts')) {
            source = '/data/email_per_day_distribution_data.csv';
          }
        }
        
        if (!source) {
          throw new Error('No data source specified');
        }
        
        console.log('Fetching data from:', source);
        
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        
        // Parse CSV data
        const parsedData = d3.csvParse(csvText);
        console.log('Parsed data:', parsedData);
        setData(parsedData as unknown as DataPoint[]);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [title, dataSource]);

  // Render chart when data is available
  useEffect(() => {
    if (!data.length || !chartRef.current) return;
    
    // Clear any existing chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    const container = chartRef.current;
    const margin = { top: 20, right: 30, bottom: 60, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', container.clientWidth)
      .attr('height', container.clientHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create chart based on data source path
    const sourcePath = dataSource || '';
    
    if (sourcePath.includes('date_distribution') || data[0]?.time) {
      // Date distribution chart - Bar chart
      const parseTime = d3.timeParse('%Y-%m-%d');
      
      // Ensure data is properly formatted
      const formattedData: FormattedDatePoint[] = data.map(d => {
        // Get the key names which might vary depending on how the CSV is parsed
        const timeKey = 'time' in d ? 'time' : Object.keys(d)[0];
        const countKey = 'count' in d ? 'count' : Object.keys(d)[1];
        
        const timeValue = d[timeKey as keyof typeof d] as string;
        const countValue = +(d[countKey as keyof typeof d] as string);
        
        // Parse the date string
        const parsedDate = parseTime(timeValue);
        
        return {
          time: parsedDate,
          count: countValue
        };
      }).filter(d => d.time !== null);
      
      if (formattedData.length === 0) {
        console.error('No valid dates found in the data');
        container.innerHTML = '<p class="text-red-500 text-center">Error: Could not parse date data</p>';
        return;
      }

      // Sort data by date
      formattedData.sort((a, b) => {
        if (!a.time || !b.time) return 0;
        return a.time.getTime() - b.time.getTime();
      });

      // Set up scales
      const x = d3.scaleTime()
        .domain(d3.extent(formattedData, d => d.time) as [Date, Date])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.count) as number])
        .nice()
        .range([height, 0]);

      // Add X axis
      const xAxis = svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%b %Y') as any));
      
      xAxis.selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em');

      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(y).ticks(5));

      // Add a line chart instead of bars for better visibility with many data points
      const line = d3.line<FormattedDatePoint>()
        .defined(d => d.time !== null)
        .x(d => x(d.time!))
        .y(d => y(d.count))
        .curve(d3.curveMonotoneX);
      
      // Add the line path
      svg.append('path')
        .datum(formattedData)
        .attr('fill', 'none')
        .attr('stroke', '#6366F1')
        .attr('stroke-width', 2)
        .attr('d', line);
      
      // Add points
      svg.selectAll('.dot')
        .data(formattedData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.time!))
        .attr('cy', d => y(d.count))
        .attr('r', 4)
        .attr('fill', '#6366F1')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1);
        
      // Add labels
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 5)
        .text('Date')
        .attr('class', 'text-xs text-gray-600');
      
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .text('Count')
        .attr('class', 'text-xs text-gray-600');
      
      // Add title
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', -5)
        .text('Email Count Over Time')
        .attr('class', 'text-xs font-semibold text-gray-700');
      
    } else if (sourcePath.includes('email_per_day') || data[0]?.emails_per_day) {
      // Emails per day histogram
      const getEmailValue = (d: any): number => {
        if ('emails_per_day' in d) {
          return +d.emails_per_day;
        }
        // If the key isn't exactly 'emails_per_day', find the first key
        const firstKey = Object.keys(d)[0];
        return +d[firstKey];
      };
      
      const values = data.map(getEmailValue).filter(v => !isNaN(v));
      
      if (values.length === 0) {
        console.error('No valid email count values found');
        container.innerHTML = '<p class="text-red-500 text-center">Error: Could not parse email count data</p>';
        return;
      }
      
      // Create histogram data
      const maxValue = d3.max(values) as number;
      const histogram = d3.histogram()
        .domain([0, maxValue + 1])
        .thresholds(d3.range(0, maxValue + 2))
        (values);
      
      // Set up scales
      const x = d3.scaleLinear()
        .domain([0, maxValue + 1])
        .range([0, width]);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(histogram, d => d.length) as number])
        .nice()
        .range([height, 0]);
      
      // Add X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(Math.min(maxValue + 1, 10)).tickFormat(d3.format('d')));
      
      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(y).ticks(5));
      
      // Add bars
      svg.selectAll('rect')
        .data(histogram)
        .enter()
        .append('rect')
        .attr('x', d => x(d.x0 as number))
        .attr('width', d => Math.max(0, x(d.x1 as number) - x(d.x0 as number) - 1))
        .attr('y', d => y(d.length))
        .attr('height', d => height - y(d.length))
        .attr('fill', '#6366F1')
        .attr('rx', 2);
      
      // Add labels
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Emails per Day')
        .attr('class', 'text-xs text-gray-600');
      
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .text('Frequency')
        .attr('class', 'text-xs text-gray-600');
      
      // Add title
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', -5)
        .text('Distribution of Emails per Day')
        .attr('class', 'text-xs font-semibold text-gray-700');
    } else {
      console.warn('Could not determine chart type:', { data, dataSource });
      container.innerHTML = '<p class="text-red-500 text-center">Error: Could not determine chart type</p>';
    }
  }, [data, dataSource]);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">{title}</h2>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      <div 
        ref={chartRef} 
        className="w-full h-64 bg-gray-50 rounded flex items-center justify-center"
      >
        {loading && <p className="text-gray-500">Loading chart data...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && data.length === 0 && 
          <p className="text-gray-500">No data available</p>
        }
      </div>
    </div>
  );
};

export default DataDistribution; 