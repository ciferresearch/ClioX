(function() {
  d3.horizon = function() {
    var bands = 1, // between 1 and 5, typically
        mode = "offset", // or mirror
        area = d3.svg.area(),
        defined,
        x = d3_horizonX,
        y = d3_horizonY,
        width = window.innerWidth -50,
        height = window.innerHeight,
        maxY = 250,
        maxBands=5;

    //title = 'my category';
    neg = colorbrewer.Blues[maxBands+2];
    pos = colorbrewer.Oranges[maxBands+2];   
    neutral =  colorbrewer.Greys[maxBands+2];

    var color_negative = d3.scale.ordinal()
      .domain(d3.range(1, maxBands+1))
      .range(neg.slice(2));

    var color_positive = d3.scale.ordinal()
      .domain(d3.range(1, maxBands+1))
      .range(pos.slice(2));

    var color_neutral = d3.scale.ordinal()
      .domain(d3.range(1, maxBands+1))
      .range(neutral.slice(1));

    var color;

    var margin = {
        left: 25,
        right: 0,
    };

    xScale = d3.time.scale.utc();

    // these will be set to d3 selections later
    caption = null
    dateCaption = null
    line = null;

    /* 
      d3.bisector creates a bisect function that can be used to search an array for a specific value. 
      We will use it later in mouseover.
    */
    bisect = d3.bisector(function(d) {
      return formatDate(d[0]);
    }).left;


    // For each small multiple…
    function horizon(g) {

      g.each(function(d) {
        count = d.values.length;
        after = new Date();
        after.setFullYear(2100, 0, 14);
        before = new Date();
        before.setFullYear(2000, 0, 14);
        var g = d3.select(this),
            xMin = after,
            xMax = before,
            yMax = -Infinity,
            x0, // old x-scale
            y0, // old y-scale
            t0,
            id; // unique id for paths

        // Compute x- and y-values along with extents.
        var data = d.values.map(function(d, i) {
          var xv = x.call(this, d, i),
              yv = y.call(this, d, i);
          if (xv < xMin) xMin = xv;
          if (xv > xMax) xMax = xv;
          if (-yv > yMax) yMax = -yv;
          if (yv > yMax) yMax = yv;
          return [formatDate(xv), yv];
        });
        
        // MinY would be either  the yMax value or the minYscale = n
        bands =1;
        n = Math.ceil(maxY/maxBands);
        if (yMax > n){
          bands = Math.ceil(yMax/n);
          minY = yMax;
          //minY = yMax+(n-yMax%n);
        }else{
          minY=n;
        }
        
        horizon.bands(bands);
        
        if(d.name.indexOf("+")!=-1){color = color_positive;}
        else if(d.name.indexOf("-")!=-1){color= color_negative;}
        else{ color= color_neutral;}

        //console.log("n:"+n+" yMax:"+yMax+" bands:"+bands+" yDomainScale:"+minY);
        
        // Compute the new x- and y-scales, and transform.
        var x1 = d3.time.scale.utc().domain([xMin, xMax]).range([margin.left, width-margin.left]),
            y1 = d3.scale.linear().domain([0, minY]).range([1, height * bands]),
            t1 = d3_horizonTransform(bands, height, mode);

        //setting up the domain for the AXIS 
        xScale.domain([xMin, xMax]);
        
        // Retrieve the old scales, if this is an update.
        if (this.__chart__) {
          x0 = this.__chart__.x;
          y0 = this.__chart__.y;
          t0 = this.__chart__.t;
          id = this.__chart__.id;
          console("update");
        } else {
          x0 = x1.copy();
          y0 = y1.copy();
          t0 = t1;
          id = ++d3_horizonId;
          title = d.name
        }


        //adding category label
        g.append("text")
          .text(title)
          .attr("y", height-3)
          .attr("class", "legend");

        // We'll use a defs to store the area path and the clip path.
        var defs = g.selectAll("defs")
            .data([null]);

        // The clip path is a simple rect.
         defs.enter().append("defs").append("clipPath")
             .attr("id", "d3_horizon_clip" + id)
          .append("rect")
            .attr("width", (width  - margin.left))
            .attr("height", height)
            .attr("x", margin.left );
                     
          

        d3.transition(defs.select("rect"))
            .attr("width", (width  - margin.left ))
            .attr("height", height)
            .attr("x", margin.left);           


        // We'll use a container to clip all horizon layers at once.
        g.selectAll("g")
            .data([null])
          .enter().append("g")
            .attr("clip-path", "url(#d3_horizon_clip" + id + ")");     
            

        // Instantiate each copy of the path with different transforms.
        var path = g.select("g").selectAll("path")
            .data(d3.range(-1, -bands - 1, -1).concat(d3.range(1, bands + 1)), Number);

        if (defined) area.defined(function(_, i) { return defined.call(this, d[i], i); });

        var d0 = area
            .x(function(d) { return x0(d[0]); })
            .y0(height * bands)
            .y1(function(d) { return height * bands - y0(d[1]); })
            (data);

        var d1 = area
            .x(function(d) { return x1(d[0]); })
            .y1(function(d) { return height * bands - y1(d[1]); })
            (data);

        path.enter().append("path")
            .style("fill", color)
            .attr("transform", t0)
            .attr("d", d0);

        d3.transition(path)
            .style("fill", color)
            .attr("transform", t1)
            .attr("d", d1);

        d3.transition(path.exit())
            .attr("transform", t1)
            .attr("d", d1)
            .remove();

        // --- Add line and caption to fill in during mousemove
        
        g.append("text")
          .attr("class", "caption")
          .attr("text-anchor", "start")
          .style("pointer-events", "none")
          .attr("dx", 3);
          
        g.append("line")
          .attr("stroke", "black")
          .attr("stroke-width", "1")
          .style("pointer-events", "none")
          .attr("class", "caption-line")
          .attr("opacity", 0)
          .attr("y1", -2)
          .attr("y2", height+2);

        g.append("rect")
        .attr("width", (width  - 2*margin.left))
        .attr("height", height)
        .attr("x", margin.left)
        .attr("fill", "none")
        .style("pointer-events", "all")
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseout", mouseout); 


        // Stash the new scales.
        this.__chart__ = {x: x1, y: y1, t: t1, id: id};
      });
      
      parent = d3.select(g.node().parentNode);

      // Adding a single x-axis
      xScale.range([ margin.left, (width-margin.left)]);

      var xAxis = d3.svg.axis()
          .scale(xScale)
          .orient("bottom")
          .ticks(8);
      
      // Adding the x-axis
      parent.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" +[0, (height+2)*6] + ")")
        .call(xAxis);
              
    } //end-horizon

    horizon.bands = function(_) {
      if (!arguments.length) return bands;
      bands = +_;
      //color.domain([-bands, 0, bands]);
      return horizon;
    };

    horizon.maxBands = function(_) {
      if (!arguments.length) return maxBands;
      maxBands = +_;
      //color.domain([-bands, 0, bands]);
      return horizon;
    };

    horizon.mode = function(_) {
      if (!arguments.length) return mode;
      mode = _ + "";
      return horizon;
    };

    horizon.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      return horizon;
    };

    horizon.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return horizon;
    };

    horizon.width = function(_) {
      if (!arguments.length) return width;
      width = +_;
      return horizon;
    };

    horizon.height = function(_) {
      if (!arguments.length) return height;
      height = +_;
      return horizon;
    };

    horizon.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return horizon;
    };

    horizon.maxY = function(_) {
      if (!arguments.length) return maxY;
      maxY = +_;
      return horizon;
    };

    /** ---
    Called when viewer interacts with xAxis
    */
    mouseover = function() {
      caption = d3.selectAll(".caption");
      dateCaption = d3.select("#date-caption");
      line = d3.selectAll(".caption-line");
      line.attr("opacity", 1.0);
      return mousemove.call(this);
    };
    mousemove = function() {
      var date, index;
      xx = Math.round(d3.mouse(this)[0]);
      date = xScale.invert(xx);

      // Get any group and find the date index in the array
      // I am assuming all bands have same dates
      d3.select(".h-group")
        .each(function(c){

          //Rough... pointer date is an indicator of starting point
          index= bisect(c.values, date)-1;
          if (index<0){index=0;}

          //updating the date to the data point
          date = formatDate(c.values[index][0]);
        });

      caption
        .attr("x", xx)
        .attr("y", function(c) {
            return height/2;
        })
        .text(function(c) {
          return c.values[index][1];
        });

      line
        .attr("x1", xx)
        .attr("x2", xx);

      dateCaption.text(myStringDate(date) );
        
      
    };
    mouseout = function() {
      line.attr("opacity", 0);
      dateCaption.text("");
      return caption.text("");
    };

    return d3.rebind(horizon, area, "interpolate", "basis");
  };

  //Do I Need ISO Format? 
  //the code was simpler with EPOC for calculating extents and comparing dates
  function formatDate (dt){
    //IF DT is ISO 
    return new Date(dt);

    /* IF DT is EPOCH:
    var da = new Date(0); // The 0 there is the key, which sets the date to the epoch
    return da.setUTCSeconds(dt);*/
  }

  function myStringDate(dt){
    return dt.toUTCString();
    /*st = dt.toDateString();
    dt.getUTCHours() <10 ? st+=" 0"+dt.getUTCHours(): st+=" "+dt.getUTCHours();
    dt.getUTCMinutes()<10 ? st+=":0"+dt.getUTCMinutes() : st+=":"+dt.getUTCMinutes();
    return st;*/
  }

  var d3_horizonId = -1;

  function d3_horizonX(d) { return formatDate(d[0]); }
  function d3_horizonY(d) { return d[1]; }

  function d3_horizonTransform(bands, h, mode) {
    return mode == "offset"
        ? function(d) { return "translate(0," + (d + (d < 0) - bands) * h + ")"; }
        : function(d) { return (d < 0 ? "scale(1,-1)" : "") + "translate(0," + (d - bands) * h + ")"; };
  }
})();
