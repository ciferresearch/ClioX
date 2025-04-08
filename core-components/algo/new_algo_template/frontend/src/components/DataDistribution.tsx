'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ChartModal from './ChartModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartType, setChartType] = useState<'date' | 'email'>('date');

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
      setChartType('date');
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

      // Add area under the line with gradient
      const areaGradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'area-gradient-' + container.id)
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');

      areaGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#4F46E5')
        .attr('stop-opacity', 0.3);

      areaGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#4F46E5')
        .attr('stop-opacity', 0.05);

      // Create area generator
      const area = d3.area<FormattedDatePoint>()
        .defined(d => d.time !== null)
        .x(d => x(d.time!))
        .y0(height)
        .y1(d => y(d.count))
        .curve(d3.curveCatmullRom.alpha(0.5)); // Smoother curve

      // Add the area
      svg.append('path')
        .datum(formattedData)
        .attr('fill', 'url(#area-gradient-' + container.id + ')')
        .attr('d', area);

      // Add a line chart with smoother curve
      const line = d3.line<FormattedDatePoint>()
        .defined(d => d.time !== null)
        .x(d => x(d.time!))
        .y(d => y(d.count))
        .curve(d3.curveCatmullRom.alpha(0.5)); // Smoother curve

      // Add the line path
      svg.append('path')
        .datum(formattedData)
        .attr('fill', 'none')
        .attr('stroke', '#4F46E5') // Indigo color for line
        .attr('stroke-width', 2.5)
        .attr('d', line);

      // Add tooltip
      const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '6px 10px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 10)
        .style('box-shadow', '0 2px 5px rgba(0,0,0,0.2)')
        .style('transition', 'opacity 0.2s');

      // Add points with hover effects
      svg.selectAll('.dot')
        .data(formattedData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.time!))
        .attr('cy', d => y(d.count))
        .attr('r', 3) // Smaller points
        .attr('fill', '#F59E0B') // Amber color for points
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1)
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
          // Highlight point
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 5)
            .attr('opacity', 1);

          // Format date
          const date = d.time!.toLocaleDateString();

          // Position tooltip near point
          const [mouseX, mouseY] = d3.pointer(event, container);
          tooltip.html(`Date: ${date}<br>Count: ${d.count}`)
            .style('left', (mouseX + 10) + 'px')
            .style('top', (mouseY - 25) + 'px')
            .style('opacity', 1);
        })
        .on('mouseout', function() {
          // Restore point
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 3)
            .attr('opacity', 0.8);

          // Hide tooltip
          tooltip.style('opacity', 0);
        });

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
      setChartType('email');
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
      const histogram = d3.bin()
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

      // Add tooltip
      const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '6px 10px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 10)
        .style('box-shadow', '0 2px 5px rgba(0,0,0,0.2)')
        .style('transition', 'opacity 0.2s');

      // Add gradient for bars
      const barGradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'bar-gradient-' + container.id)
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');

      barGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#4F46E5')
        .attr('stop-opacity', 0.9);

      barGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#4F46E5')
        .attr('stop-opacity', 0.6);

      // Add bars with hover effects
      svg.selectAll('rect')
        .data(histogram)
        .enter()
        .append('rect')
        .attr('x', d => x(d.x0 as number))
        .attr('width', d => Math.max(0, x(d.x1 as number) - x(d.x0 as number) - 1))
        .attr('y', d => y(d.length))
        .attr('height', d => height - y(d.length))
        .attr('fill', 'url(#bar-gradient-' + container.id + ')') // Gradient fill
        .attr('rx', 2) // Rounded corners
        .attr('opacity', 0.9)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5)
        .on('mouseover', function(event, d) {
          // Highlight bar
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1);

          // Position tooltip near bar
          const [mouseX, mouseY] = d3.pointer(event, container);
          tooltip.html(`Emails: ${d.x0} - ${d.x1}<br>Count: ${d.length}`)
            .style('left', (mouseX + 10) + 'px')
            .style('top', (mouseY - 25) + 'px')
            .style('opacity', 1);
        })
        .on('mouseout', function() {
          // Restore bar
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.9);

          // Hide tooltip
          tooltip.style('opacity', 0);
        });

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

  // Handle opening the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {data.length > 0 && !loading && !error && (
          <button
            onClick={handleOpenModal}
            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Zoom
          </button>
        )}
      </div>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      <div
        ref={chartRef}
        className="w-full h-64 bg-gray-50 rounded flex items-center justify-center cursor-pointer"
        onClick={data.length > 0 && !loading && !error ? handleOpenModal : undefined}
      >
        {loading && <p className="text-gray-500">Loading chart data...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && data.length === 0 &&
          <p className="text-gray-500">No data available</p>
        }
      </div>

      {/* Modal for zoomed view */}
      <ChartModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={title}
        chartData={data}
        chartType={chartType}
      />
    </div>
  );
};

export default DataDistribution;