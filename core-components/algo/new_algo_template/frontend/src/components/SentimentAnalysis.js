import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../styles/SentimentAnalysis.css';

const SentimentAnalysis = ({ data }) => {
  const horizonRef = useRef(null);
  const wordsTableRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // D3 drawing function
    const drawHorizonChart = () => {
      // Clear previous chart
      d3.select(horizonRef.current).selectAll("*").remove();

      // Set dimensions and margins
      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const width = horizonRef.current.clientWidth - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      const bandHeight = 60;

      // Create SVG element
      const svg = d3.select(horizonRef.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", data.length * (bandHeight + 5) + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Parse dates
      const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
      
      // Process data
      const processedData = data.map(d => {
        return {
          name: d.name,
          values: d.values.map(v => {
            return [parseTime(v[0]), v[1]];
          })
        };
      });

      // Calculate date range
      let xMin = d3.min(processedData, d => d3.min(d.values, v => v[0]));
      let xMax = d3.max(processedData, d => d3.max(d.values, v => v[0]));
      
      // Create X scale
      const x = d3.scaleTime()
        .domain([xMin, xMax])
        .range([0, width]);
      
      // Create X axis
      const xAxis = d3.axisBottom(x)
        .ticks(10);
      
      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${data.length * (bandHeight + 5)})`)
        .call(xAxis);
      
      // Draw areas for each sentiment category
      processedData.forEach((d, i) => {
        // Calculate value range
        const yMax = d3.max(d.values, v => v[1]);
        
        // Create Y scale
        const y = d3.scaleLinear()
          .domain([0, yMax || 1]) // Prevent max value of 0
          .range([bandHeight, 0]);
        
        // Create line generator
        const line = d3.line()
          .x(v => x(v[0]))
          .y(v => y(v[1]))
          .curve(d3.curveBasis);
        
        // Create area generator
        const area = d3.area()
          .x(v => x(v[0]))
          .y0(bandHeight)
          .y1(v => y(v[1]))
          .curve(d3.curveBasis);
        
        // Add label
        svg.append("text")
          .attr("x", 0)
          .attr("y", i * (bandHeight + 5) + 15)
          .text(d.name)
          .style("font-weight", "bold");
        
        // Select color
        let color;
        if (d.name.includes("+")) {
          color = "orange";
        } else if (d.name.includes("-")) {
          color = "steelblue";
        } else {
          color = "gray";
        }
        
        // Add area
        svg.append("path")
          .datum(d.values)
          .attr("transform", `translate(0,${i * (bandHeight + 5)})`)
          .attr("fill", color)
          .attr("opacity", 0.6)
          .attr("d", area);
        
        // Add line
        svg.append("path")
          .datum(d.values)
          .attr("transform", `translate(0,${i * (bandHeight + 5)})`)
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("d", line);
      });

      // Add mouse interactions
      const overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", data.length * (bandHeight + 5))
        .style("opacity", 0)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

      // Add vertical line
      const verticalLine = svg.append("line")
        .attr("class", "vertical-line")
        .attr("y1", 0)
        .attr("y2", data.length * (bandHeight + 5))
        .style("stroke", "#333")
        .style("stroke-width", 1)
        .style("opacity", 0);

      // Add date label
      const dateLabel = svg.append("text")
        .attr("class", "date-label")
        .attr("x", 10)
        .attr("y", data.length * (bandHeight + 5) + 20)
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .style("opacity", 0);

      function mousemove(event) {
        const [mouseX] = d3.pointer(event);
        const x0 = x.invert(mouseX);
        
        // Show vertical line and date label
        verticalLine
          .attr("x1", mouseX)
          .attr("x2", mouseX)
          .style("opacity", 1);
          
        dateLabel
          .attr("x", mouseX > width - 100 ? mouseX - 100 : mouseX + 10)
          .text(d3.timeFormat("%Y-%m-%d")(x0))
          .style("opacity", 1);
          
        // Show data table
        wordsTableRef.current.style.display = "block";
        updateTableData(x0);
      }

      function mouseout() {
        // Hide vertical line and date label
        verticalLine.style("opacity", 0);
        dateLabel.style("opacity", 0);
      }

      function updateTableData(date) {
        // Example word data, should be replaced with real data in production
        const tbody = d3.select(wordsTableRef.current).select("tbody");
        tbody.html("");
        
        const sentimentCategories = {
          "+2": "Very Positive",
          "+1": "Positive",
          "0": "Neutral",
          "-1": "Negative",
          "-2": "Very Negative"
        };
        
        // Add a row for each sentiment category
        Object.entries(sentimentCategories).forEach(([category, label]) => {
          const tr = tbody.append("tr");
          
          // Add sentiment category
          tr.append("td")
            .html(`<span class="sentiment-color-dot" style="background-color: ${
              category.includes("+") ? "orange" : 
              category.includes("-") ? "steelblue" : "gray"
            }"></span>${label}`);
          
          // Add example words
          tr.append("td")
            .text(getExampleWords(category));
        });
      }

      function getExampleWords(category) {
        // This should return words related to specific sentiment category
        // In a real project, this data should come from API or other data source
        const wordsByCategory = {
          "+2": "excellent, amazing, outstanding, fantastic",
          "+1": "good, nice, pleasant, helpful",
          "0": "normal, regular, standard, typical",
          "-1": "bad, poor, disappointing, unhappy",
          "-2": "terrible, horrible, awful, disastrous"
        };
        
        return wordsByCategory[category] || "No data available";
      }
    };

    drawHorizonChart();

    // Responsive adjustment
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
          <tbody></tbody>
        </table>
      </div>
    </div>
  );
};

export default SentimentAnalysis;