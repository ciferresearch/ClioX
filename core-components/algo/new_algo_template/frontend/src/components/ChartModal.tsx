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
  const marginRef = useRef<{ top: number; right: number; bottom: number; left: number }>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (!isOpen || !modalChartRef.current || !chartData || chartData.length === 0) return;

    const container = modalChartRef.current;
    const margin = { top: 40, right: 60, bottom: 80, left: 70 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    // Clear any existing chart
    d3.select(container).selectAll('*').remove();

    // Create base SVG
    const baseSvg = d3.select(container)
      .append('svg')
      .attr('width', container.clientWidth)
      .attr('height', container.clientHeight);

    const chartGroup = baseSvg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set initial transform
    const initialScale = 0.85; // Slightly zoomed out to show all labels
    const initialX = margin.left;
    const initialY = margin.top - 20; // Move up slightly to show bottom labels better

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        chartGroup.attr('transform',
          `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${event.transform.k})`
        );
        setZoomLevel(event.transform.k);
      });

    // Store zoom behavior and margins in ref for external control
    zoomRef.current = zoom;
    marginRef.current = margin;

    // Apply zoom behavior
    baseSvg
      .call(zoom)
      .on('dblclick.zoom', null)
      .style('cursor', 'grab')
      .on('mousedown', function() {
        d3.select(this).style('cursor', 'grabbing');
      })
      .on('mouseup', function() {
        d3.select(this).style('cursor', 'grab');
      });

    // Apply initial transform
    baseSvg.call(
      zoom.transform,
      d3.zoomIdentity
        .translate(initialX, initialY)
        .scale(initialScale)
    );

    // Update zoom level display
    setZoomLevel(initialScale);

    if (chartType === 'date') {
      // Date distribution line chart
      const formattedData = chartData.map((d: any) => {
        const time = d3.timeParse('%Y-%m-%d')(d.time);
        return {
          time: time,
          count: +d.count
        };
      }).filter((d: any) => d.time !== null);

      // Set up scales
      const x = d3.scaleTime()
        .domain(d3.extent(formattedData, (d: any) => d.time) as [Date, Date])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, (d: any) => d.count) || 0])
        .nice()
        .range([height, 0]);

      // Add X axis with more space for labels
      const xAxis = chartGroup.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%b %Y') as any));

      xAxis.selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '1em');

      // Add Y axis
      chartGroup.append('g')
        .call(d3.axisLeft(y));

      // Add area under the line with gradient
      const areaGradient = chartGroup.append('defs')
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
      chartGroup.append('path')
        .datum(formattedData)
        .attr('fill', 'url(#area-gradient)')
        .attr('d', area);

      // Add line with smoother curve
      const line = d3.line<any>()
        .defined(d => !isNaN(d.count))
        .x(d => x(d.time))
        .y(d => y(d.count))
        .curve(d3.curveCatmullRom.alpha(0.5)); // Smoother curve

      chartGroup.append('path')
        .datum(formattedData)
        .attr('fill', 'none')
        .attr('stroke', '#4F46E5') // Indigo color for line
        .attr('stroke-width', 2.5)
        .attr('d', line);

      // Add points with hover effect
      const dots = chartGroup.selectAll('.dot')
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

      // Add hover effects to dots
      dots.on('mouseover', function(event, d) {
          // Highlight point
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 5)
            .attr('opacity', 1);

          // Format date
          const date = d.time.toLocaleDateString();

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
      chartGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Date')
        .attr('class', 'text-sm text-gray-600');

      chartGroup.append('text')
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
        // If the key isn't exactly 'emails_per_day', find the first key
        const firstKey = Object.keys(d)[0];
        return +d[firstKey];
      };

      // Get min and max values
      const minValue = d3.min(chartData, getEmailValue) || 0;
      const maxValue = d3.max(chartData, getEmailValue) || 10;

      // Create a simple histogram-like data structure
      // Count occurrences of each value
      const values = chartData.map(getEmailValue).filter(v => !isNaN(v));
      const valueCounts = new Map();
      values.forEach(value => {
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
      });

      // Convert to histogram format
      const histogram = Array.from(valueCounts.entries()).map(([value, count]) => ({
        x0: value,
        x1: +value + 1,
        length: count
      })).sort((a, b) => a.x0 - b.x0);

      // Set up scales
      const x = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(histogram, d => d.length) || 0])
        .nice()
        .range([height, 0]);

      // Add X axis with more space for labels
      chartGroup.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(Math.min(maxValue + 1, 15)).tickFormat(d3.format('d')))
        .selectAll('text')
        .style('text-anchor', 'middle')
        .attr('dy', '1em');

      // Add Y axis
      chartGroup.append('g')
        .call(d3.axisLeft(y).ticks(5));

      // Add gradient for bars
      const barGradient = chartGroup.append('defs')
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

      // Add bars with hover effects (if not disabled)
      const bars = chartGroup.selectAll('rect')
        .data(histogram)
        .enter()
        .append('rect')
        .attr('x', d => x(d.x0 as number))
        .attr('width', d => Math.max(0, x(d.x1 as number) - x(d.x0 as number) - 1))
        .attr('y', d => y(d.length))
        .attr('height', d => height - y(d.length))
        .attr('fill', 'url(#bar-gradient)') // Gradient fill
        .attr('rx', 2) // Rounded corners
        .attr('opacity', 0.9)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5);

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
      bars.on('mouseover', function(event, d) {
          // Highlight bar
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
          // Restore bar
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.9);

          // Hide tooltip
          tooltip.style('opacity', 0);
        });

      // Add labels
      chartGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Emails per Day')
        .attr('class', 'text-sm text-gray-600');

      chartGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Frequency')
        .attr('class', 'text-sm text-gray-600');
    }

    // Zoom behavior is already set up in the initial SVG creation

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

      // Apply initial transform
      const initialScale = 0.85;
      const initialX = marginRef.current?.left || 0;
      const initialY = (marginRef.current?.top || 0) - 20;

      svg.transition().duration(300).call(
        zoomRef.current.transform,
        d3.zoomIdentity
          .translate(initialX, initialY)
          .scale(initialScale)
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 text-gray-800">
              <h2 className="text-xl font-semibold">{title}</h2>
              <div className="flex items-center space-x-3">
                {/* Zoom controls in header */}
                <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                  <button
                    onClick={handleZoomOut}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700"
                    title="Zoom Out"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <span className="text-xs text-gray-600 font-medium px-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>

                  <button
                    onClick={handleZoomIn}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700"
                    title="Zoom In"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <button
                    onClick={handleResetZoom}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700"
                    title="Reset Zoom"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="relative flex-grow overflow-hidden">
              <div
                ref={modalChartRef}
                className="absolute inset-0 bg-gray-50 p-2 border border-gray-200 rounded-md"
              >
                {/* Chart will be rendered here */}
              </div>

              {/* Tip panel that appears when showControls is true */}
              {showControls && (
                <div className="absolute left-4 bottom-4 bg-white bg-opacity-90 rounded-lg shadow-md p-3 z-10 max-w-xs border border-gray-200">
                  <div className="text-sm text-gray-700">
                    <h3 className="font-medium mb-1">Chart Controls:</h3>
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-center">
                        <span className="bg-gray-200 rounded-full p-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                        </span>
                        <span>Click and drag to pan the chart</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-gray-200 rounded-full p-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </span>
                        <span>Use mouse wheel to zoom in/out</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-gray-200 rounded-full p-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </span>
                        <span>Use the reset button to restore the view</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 border-t flex justify-between items-center bg-gray-50">
              <div className="text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Drag to pan, scroll to zoom, or use the controls above</span>
              </div>

              {/* Tip dismissal button */}
              <div className="relative group">
                <button
                  onClick={toggleControls}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  {showControls ? 'Hide Tip' : 'Show Tip'}
                </button>
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Click to toggle the tip visibility
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChartModal;
