'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  chartData: any;
  chartType: 'date' | 'email';
}

const ChartModal = ({ isOpen, onClose, title, chartData, chartType }: ChartModalProps) => {
  const modalChartRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!isOpen || !modalChartRef.current || !chartData || chartData.length === 0) return;

    // Clear any existing chart
    d3.select(modalChartRef.current).selectAll('*').remove();

    const container = modalChartRef.current;
    const margin = { top: 40, right: 50, bottom: 70, left: 70 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', container.clientWidth)
      .attr('height', container.clientHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (chartType === 'date') {
      // Date distribution chart
      const parseTime = d3.timeParse('%Y-%m-%d');

      // Format data
      const formattedData = chartData.map((d: any) => {
        const timeKey = 'time' in d ? 'time' : Object.keys(d)[0];
        const countKey = 'count' in d ? 'count' : Object.keys(d)[1];

        const timeValue = d[timeKey] as string;
        const countValue = +(d[countKey] as string);

        return {
          time: parseTime(timeValue),
          count: countValue
        };
      }).filter((d: any) => d.time !== null);

      // Set up scales
      // Safely create domain extents
      const timeExtent = d3.extent(formattedData, (d: any) => d.time);
      const xDomain: [Date, Date] = [
        timeExtent[0] ? new Date(timeExtent[0]) : new Date(),
        timeExtent[1] ? new Date(timeExtent[1]) : new Date()
      ];

      const x = d3.scaleTime()
        .domain(xDomain)
        .range([0, width]);

      const maxCount = d3.max(formattedData, (d: any) => Number(d.count)) || 10;
      const y = d3.scaleLinear()
        .domain([0, maxCount])
        .nice()
        .range([height, 0]);

      // Add X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(y));

      // Sort data by date for smoother line
      formattedData.sort((a: any, b: any) => a.time.getTime() - b.time.getTime());

      // Add area under the line with gradient
      const areaGradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'area-gradient')
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
      const area = d3.area<any>()
        .defined(d => !isNaN(d.count))
        .x(d => x(d.time))
        .y0(height)
        .y1(d => y(d.count))
        .curve(d3.curveCatmullRom.alpha(0.5)); // Smoother curve

      // Add the area
      svg.append('path')
        .datum(formattedData)
        .attr('fill', 'url(#area-gradient)')
        .attr('d', area);

      // Add line with smoother curve
      const line = d3.line<any>()
        .defined(d => !isNaN(d.count))
        .x(d => x(d.time))
        .y(d => y(d.count))
        .curve(d3.curveCatmullRom.alpha(0.5)); // Smoother curve

      svg.append('path')
        .datum(formattedData)
        .attr('fill', 'none')
        .attr('stroke', '#4F46E5') // Indigo color for line
        .attr('stroke-width', 2.5)
        .attr('d', line);

      // Add points with hover effect
      const dots = svg.selectAll('.dot')
        .data(formattedData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d: any) => x(d.time))
        .attr('cy', (d: any) => y(d.count))
        .attr('r', 3) // Smaller points
        .attr('fill', '#F59E0B') // Amber color for points
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.8);

      // Add tooltip
      const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 10)
        .style('box-shadow', '0 2px 10px rgba(0,0,0,0.2)')
        .style('max-width', '200px')
        .style('transition', 'opacity 0.2s');

      // Add hover effects
      dots.on('mouseover', function(_event: any, d: any) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6)
            .attr('opacity', 1);

          const date = d.time.toLocaleDateString();
          // Calculate tooltip position
          const svgRect = container.getBoundingClientRect();
          const circleRect = this.getBoundingClientRect();

          // Position tooltip next to the point
          const tooltipX = circleRect.right - svgRect.left + 5;
          let tooltipY = circleRect.top - svgRect.top - 10;

          // Make sure tooltip is visible within the container
          const tooltipWidth = 150; // Approximate width
          if (tooltipX + tooltipWidth > svgRect.width) {
            // If tooltip would go outside right edge, position it to the left of the point
            tooltip
              .style('left', (circleRect.left - svgRect.left - tooltipWidth - 5) + 'px')
              .style('top', tooltipY + 'px');
          } else {
            tooltip
              .style('left', tooltipX + 'px')
              .style('top', tooltipY + 'px');
          }

          tooltip.html(`Date: ${date}<br>Count: ${d.count}`)
            .style('opacity', 1);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 3)
            .attr('opacity', 0.8);

          tooltip.style('opacity', 0);
        });

      // Add labels
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Date')
        .attr('class', 'text-sm text-gray-600');

      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Count')
        .attr('class', 'text-sm text-gray-600');

    } else if (chartType === 'email') {
      // Emails per day histogram
      const getEmailValue = (d: any): number => {
        if ('emails_per_day' in d) {
          return +d.emails_per_day;
        }
        const firstKey = Object.keys(d)[0];
        return +d[firstKey];
      };

      const values = chartData.map(getEmailValue).filter((v: number) => !isNaN(v));

      if (values.length === 0) {
        console.error('No valid email count values found');
        container.innerHTML = '<p class="text-red-500 text-center">Error: Could not parse email count data</p>';
        return;
      }

      // Create histogram data
      const maxValue = Number(d3.max(values)) || 10;
      const histogram = d3.bin()
        .domain([0, maxValue + 1])
        .thresholds(d3.range(0, maxValue + 2))
        (values);

      // Set up scales
      const x = d3.scaleLinear()
        .domain([0, maxValue + 1])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(histogram, d => d.length) || 0])
        .nice()
        .range([height, 0]);

      // Add X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(Math.min(maxValue + 1, 10)).tickFormat(d3.format('d')));

      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(y).ticks(5));

      // Add gradient for bars
      const barGradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'bar-gradient')
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

      // Add bars with hover effect
      const bars = svg.selectAll('rect')
        .data(histogram)
        .enter()
        .append('rect')
        .attr('x', d => x(d.x0 as number))
        .attr('y', d => y(d.length))
        .attr('width', d => Math.max(0, x(d.x1 as number) - x(d.x0 as number) - 1))
        .attr('height', d => height - y(d.length))
        .attr('fill', 'url(#bar-gradient)')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1)
        .attr('rx', 2) // Rounded corners
        .attr('opacity', 0.9);

      // Add tooltip for bars
      const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 10)
        .style('box-shadow', '0 2px 10px rgba(0,0,0,0.2)')
        .style('max-width', '200px')
        .style('transition', 'opacity 0.2s');

      // Add hover effects to bars
      bars.on('mouseover', function(_event: any, d: any) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1);

          // Calculate tooltip position
          const svgRect = container.getBoundingClientRect();
          const barRect = this.getBoundingClientRect();

          // Position tooltip next to the bar
          const tooltipX = barRect.right - svgRect.left + 5;
          let tooltipY = barRect.top - svgRect.top + (barRect.height / 2);

          // Make sure tooltip is visible within the container
          const tooltipWidth = 150; // Approximate width
          if (tooltipX + tooltipWidth > svgRect.width) {
            // If tooltip would go outside right edge, position it to the left of the bar
            tooltip
              .style('left', (barRect.left - svgRect.left - tooltipWidth - 5) + 'px')
              .style('top', tooltipY + 'px');
          } else {
            tooltip
              .style('left', tooltipX + 'px')
              .style('top', tooltipY + 'px');
          }

          tooltip.html(`Emails: ${d.x0} - ${d.x1}<br>Count: ${d.length}`)
            .style('opacity', 1);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.9);

          tooltip.style('opacity', 0);
        });

      // Add labels
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Emails per Day')
        .attr('class', 'text-sm text-gray-600');

      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Frequency')
        .attr('class', 'text-sm text-gray-600');
    }

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5]) // Allow zoom range: 0.5x to 5x
      .on('zoom', (event) => {
        svg.attr('transform', `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${event.transform.k})`);
        setZoomLevel(event.transform.k);
      });

    // Store zoom behavior in ref for external control
    zoomRef.current = zoom;

    // Add zoom behavior to SVG
    d3.select(container).select('svg')
      .call(zoom as any)
      .on('dblclick.zoom', null) // Disable double-click zoom
      .style('cursor', 'grab')
      .on('mousedown', function() {
        d3.select(this).style('cursor', 'grabbing');
      })
      .on('mouseup', function() {
        d3.select(this).style('cursor', 'grab');
      });



  }, [isOpen, chartData, chartType, title]);

  // Handle zoom in
  const handleZoomIn = () => {
    if (zoomRef.current && modalChartRef.current) {
      const svg = d3.select(modalChartRef.current).select('svg');
      svg.transition().duration(300).call(
        zoomRef.current.scaleBy, 1.3
      );
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (zoomRef.current && modalChartRef.current) {
      const svg = d3.select(modalChartRef.current).select('svg');
      svg.transition().duration(300).call(
        zoomRef.current.scaleBy, 0.7
      );
    }
  };

  // Handle reset zoom
  const handleResetZoom = () => {
    if (zoomRef.current && modalChartRef.current) {
      const svg = d3.select(modalChartRef.current).select('svg');
      svg.transition().duration(300).call(
        zoomRef.current.transform, d3.zoomIdentity
      );
    }
  };

  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <h2 className="text-xl font-semibold">{title}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-indigo-800 px-2 py-1 rounded-full shadow-inner">
                  Zoom: {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 text-2xl font-bold ml-4 transition-transform hover:scale-110"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="relative flex-grow overflow-hidden">
              <div
                ref={modalChartRef}
                className="absolute inset-0 bg-gray-50 p-2"
              >
                {/* Chart will be rendered here */}
              </div>

              {/* Zoom controls */}
              <div
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-r-lg shadow-md flex flex-col p-2 z-10"
                style={{ left: showControls ? '20px' : '-50px', transition: 'left 0.3s ease-in-out' }}
              >
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-200 rounded-full mb-2 transition-colors"
                  title="Zoom In"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-200 rounded-full mb-2 transition-colors"
                  title="Zoom Out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  title="Reset Zoom"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Toggle button */}
              <button
                onClick={toggleControls}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-r-lg shadow-md p-1 z-10 transition-transform hover:scale-110"
                style={{ left: showControls ? '-100px' : '0' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-3 border-t flex justify-between items-center bg-gray-50">
              <div className="text-xs text-gray-500">
                <span className="font-medium">Tip:</span> Drag to pan, scroll to zoom, or use the controls
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow transition-all hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChartModal;
