var horizons_load = function(){ 
    //variables accessible to the rest of the functions inside SmallMultiples
    
    // width = 500;
    // height = 300;
    // band_height = 25;
    // hmargin = {
    //   top: 2
    // };
    
    // set the width of the chart to be 0% of the father container width 
    function getContainerWidth() {
      var container = document.getElementById('vis-horizon');
      if (container) {
          var parentWidth = container.parentNode.clientWidth;
          // Account for padding (40px total from both sides)
          return parentWidth - 40;
      }
      return Math.min(800, window.innerWidth * 0.95);
  }

    // Calculate dimensions based on container
    var availableWidth = getContainerWidth();

    // Set margins as a percentage of available width
    var marginPercent = 0.03; // 3% margin
    var margin = {
        left: Math.floor(availableWidth * marginPercent),
        right: Math.floor(availableWidth * marginPercent)
    };

    // Width is container width minus margins
    width = availableWidth - margin.left - margin.right;

    // END


    // var windowWidth = window.innerWidth;
    // var marginPercent = 0.05; // 5% margin
    // var margin = {
    //   left: Math.floor(windowWidth * marginPercent), 
    //   right: Math.floor(windowWidth * marginPercent)
    // }; 
    
    // // Limit width and add margins - at most 80% of window width
    // width = Math.min(windowWidth * 0.8, windowWidth - margin.left - margin.right); 
    
    height = window.innerHeight;
    band_height = 100; // height of each band
    hmargin = {
      top: 2
    };

    var chart = d3.horizon()
      .width(width)
      .height(band_height)
      .mode("offset")
      .interpolate("basis")
      ;
      
    
    func_horizonchart = function init(selection){  

        var svg = selection.append("svg")
          .attr("width", width )
          .attr("height", height)
          .style("margin", "0 auto")
          .style("display", "block");;

        d3.json(dir+"sentiment_converted.json", function(error, data) {

          min=Infinity;
          max=0;
          data.forEach(function(d,i){
              var list = d.values.map(function(c){
                return c[1];
              });            
              var val = d3.extent(list);
              if(val[0]<min){min =val[0];}
              if(val[1]>max){max = val[1];}
              //console.log(min, max, d.name, val);
          });

          
          // How many max bands?
          if(max<chart.maxY()){chart.maxBands(1)}
          // max for yScale
          chart.maxY(max);
          

          /** ---
          Create a div and an SVG element for each element in
          our data array. Note that data is a nested array
          with each element containing another array of 'values'
          */

          g = svg.selectAll("g").data(data);

          // Adding chart title
          svg.append("text")
            .text("Sentiment Categories")
            .attr("y", "10")
            .attr("dy", ".75em")
            .attr("class", "bold-legend")
            .style("text-anchor", "end")
            .attr("x", width-25);
          
          g.enter()
            .append("g")
            .attr("class", "h-group")
            .attr("transform", function(d,i){
              return "translate("+ [0, 15+i*(band_height + hmargin.top)]+ ")";
            });
          g.call(chart);

          // showing the date   
          svg.append("text")
            .text("date")
            .attr("id", "date-caption")
            .attr("class", "bold-legend")
            .attr("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("x", width/2)
            .attr("y", height/2);

        });
    }

    return func_horizonchart;
}