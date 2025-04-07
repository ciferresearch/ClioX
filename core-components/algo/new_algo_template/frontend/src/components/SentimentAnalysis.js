import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './SentimentAnalysis.css';

const SentimentAnalysis = ({ data }) => {
  const horizonRef = useRef(null);
  const wordsTableRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;


    const drawHorizonChart = () => {

      d3.select(horizonRef.current).selectAll("*").remove();


      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const width = horizonRef.current.clientWidth - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      const bandHeight = 60;


      const svg = d3.select(horizonRef.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", data.length * (bandHeight + 5) + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
      

      const processedData = data.map(d => {
        return {
          name: d.name,
          values: d.values.map(v => {
            return [parseTime(v[0]), v[1]];
          })
        };
      });

      let xMin = d3.min(processedData, d => d3.min(d.values, v => v[0]));
      let xMax = d3.max(processedData, d => d3.max(d.values, v => v[0]));
      
      const x = d3.scaleTime()
        .domain([xMin, xMax])
        .range([0, width]);
      
      const xAxis = d3.axisBottom(x)
        .ticks(10);
      
      svg.append("g")
        .attr("transform", `translate(0,${data.length * (bandHeight + 5)})`)
        .call(xAxis);
      
      // draw each band for sentiment category
      processedData.forEach((d, i) => {
        // calculate y scale
        const yMax = d3.max(d.values, v => v[1]);
        
        // create y scale
        const y = d3.scaleLinear()
          .domain([0, yMax || 1]) // 
          .range([bandHeight, 0]);
        
        // add line generator
        const line = d3.line()
          .x(v => x(v[0]))
          .y(v => y(v[1]))
          .curve(d3.curveBasis);
        
        // add area generator
        const area = d3.area()
          .x(v => x(v[0]))
          .y0(bandHeight)
          .y1(v => y(v[1]))
          .curve(d3.curveBasis);
        
        // add band rectangle
        svg.append("text")
          .attr("x", 0)
          .attr("y", i * (bandHeight + 5) + 15)
          .text(d.name)
          .style("font-weight", "bold");
        
        // choose color based on sentiment
        let color;
        if (d.name.includes("+")) {
          color = "orange";
        } else if (d.name.includes("-")) {
          color = "steelblue";
        } else {
          color = "gray";
        }
        
        // add area
        svg.append("path")
          .datum(d.values)
          .attr("transform", `translate(0,${i * (bandHeight + 5)})`)
          .attr("fill", color)
          .attr("opacity", 0.6)
          .attr("d", area);
        
        // add line 
        svg.append("path")
          .datum(d.values)
          .attr("transform", `translate(0,${i * (bandHeight + 5)})`)
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("d", line);
      });
    };

    drawHorizonChart();


    const handleResize = () => {
      drawHorizonChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data]);

  return (
    <div className="sentiment-analysis">
      <div ref={horizonRef} className="horizon-chart"></div>
      <div ref={wordsTableRef} className="words-table-container" style={{ display: 'none' }}>
        <h3>Contributing Words by Sentiment Category</h3>
        <table className="words-table">
          <thead>
            <tr>
              <th>Sentiment Category</th>
              <th>Contributing Words</th>
            </tr>
          </thead>
          <tbody id="words-table-body"></tbody>
        </table>
      </div>
    </div>
  );
};

export default SentimentAnalysis;