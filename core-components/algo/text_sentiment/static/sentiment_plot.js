var sentiment_load = function(){    
    
    var svg;

    // plot margins
    var spark = {
            height:40,
            margint:5,
            marginb:0,
            marginr:25, // I use it only for the title
            marginl:25,
          }

    var xScale = d3.time.scale.utc();
      
    var yScale = d3.scale.linear()
      .range([(spark.height-spark.marginb), spark.margint]);;

    var emptyAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .ticks(0);        

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .ticks(8);

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .ticks(3)
      .tickFormat(d3.format("s"));

    var lines = Array();
    var _eventsColorScale = d3.scale.ordinal()
      .domain(["a", "b", "c", "d", "e", "f"])
      .range(colores_google(6));
    

// function to draw the plot 
func_lines = function (selection){  

    selection.each(function(csv){
          
        svg = selection;
        var g = svg.append("g");

        if(_transform!=null){
            g.attr("transform", "translate("+_transform+")");
        }

        //set up scales range       
        xScale.range([spark.marginl, (_width-spark.marginl)])
        .domain(d3.extent(csv, function(d){ return formatDate(d.date);})); 

        yMin =1000, yMax=0;

        // create lines for each variable   
        _names.forEach(function(vari, i){
            var line = d3.svg.line()
            .x(function(d) {  
                return xScale(formatDate(d.date));
            });

            lines.push(line);


            //calculate yScale
            lims = d3.extent(csv, function(d) { return d[vari];})
            if (lims[0]<yMin){yMin = lims[0];}
            if (lims[1]>yMax){yMax = lims[1];}
        });
      
      
        yScale.domain([Math.ceil(yMin), Math.ceil(yMax)]);
      
        // draw lines 
        _names.forEach(function(name, i){
            
            lines[i].y(function(d) { return yScale(d[name]); });

            g.selectAll("sparkline"+i)
                .data(function(d){ return [d];})
                .enter()
                .append("path")
                .attr("class", _class_style)
                .attr("id", "sparkline"+i)
                .attr("d", lines[i])
                .attr("stroke", function(d) {
                if (_colors != null){ return _colors[i];}
                else{ return "#74736c";}
                });
            
      });
          
    //y-axis
    g.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate("+spark.marginl+",0)")
        .call(yAxis);

    //Single X Axis 
    if(_axis_flag){
      g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+ [0, _height-20+1]+ ")")
        .call(xAxis);  
    } else{
      g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+ [0, _height-20+1]+ ")")
        .call(emptyAxis);  
    }

    //Title
    if(_chart_title != null){
      g.append("text")
        .attr("dy", ".75em")
        .style("text-anchor", "end")
        .attr("x", _width-spark.marginr)
        .attr("class","bold-legend")
        .text(_chart_title);
      }

    //Events
    if(_events != null){
        
        //****** Legend  *********//    
        egroups = d3.select(_events_div).append("svg")
          .attr("width", _width)
          .attr("height", spark.height*0.6)
          .selectAll(".events-legend-group")
            .data(_events)
            .enter()
            .append("g")
            .attr("class", "events-legend-group")
            .attr("transform", function(d,i){
                var tl = d.event.length;
                var distx=0, disty=4;
                for(ind=0; ind<i; ind++){
                  distx += _events[ind].event.length+10;
                  if(distx*4 > (_width-80)){
                    distx =0;
                    disty = 15;
                  }
                }
                return "translate("+ [distx*4, disty]+ ")";  
            });
          
        // Learning: d3.each gives me d, i and 'this' is the element I am selecting
        // Learning: js.forEach iterates over arrays, doesn't give me 'this'
        egroups.each(function(d, i){
            var gr = d3.select(this);
            gr.append("rect")
              .attr("width", 5)
              .attr("height", 5)
              .attr("fill", function(){
                ecolor = _eventsColorScale(d.group);
                d["color"] = ecolor; 
                return ecolor;
              });
            var txt = gr.append("text")
              .attr("text-anchor", "start")
              .text(d.event)
              .attr("fill", "black")
              .attr("x", 7)
              .attr("y", 5);
        });
          
       //****** Vertical Lines on chart   *********//
       var ev_g = svg.append("g")
            .attr("class", "events_group");
        _events.forEach(function(d){
            //Create line - events!
            ev_g.append("line")
              .attr("stroke", function(){
                  return d.color;
              })
              .attr("stroke-width", "2")
              .style("stroke-dasharray", ("4, 3")) 
              .attr("class", "event-line")
              .attr("opacity", 0)
              .attr("y1", 0)
              .attr("y2", spark.height)
              .attr("x1", xScale(formatDate(d.date)))
              .attr("x2", xScale(formatDate(d.date)));
            
            ev_g.append("text")
              .attr("text-anchor", "start")
              .attr("class", "event-label")
              .text(d.group)
              .attr("fill", function(){
                  return d.color;
              })
              .attr("dx", 3)
              .attr("x", xScale(formatDate(d.date)))
              .attr("y", 7)
              .attr("opacity", 0);
        });
    }
          
  });

}

// ===========================================
// UPDATE LINEs PATHs (Transition Animations)
// ===========================================
func_lines.update = function(__) {
  if (arguments.length) {
      svg.select(".bold-legend")
        .text(_chart_title);

      svg.data([__]);

      //Draw Lines again!
      yMin=1000, yMax=0;
      _names.forEach(function(name, i){
        lims = d3.extent(__, function(d) { return d[name];})
        //console.log(vari,lims);
        if (lims[0]<yMin){yMin = lims[0];}
        if (lims[1]>yMax){yMax = lims[1];}
      });
      
      
      yScale.domain([Math.ceil(yMin), Math.ceil(yMax)]);
      //console.log(yMin, Math.ceil(yMin), yMax, Math.ceil(yMax));

      //lines 
      _names.forEach(function(name, i){
          
          lines[i].y(function(d) { return yScale(d[name]); });

          svg.selectAll("#sparkline"+i)
            .data(function(d){ return [d];})
            .transition()
            .duration(300)
            .ease("quad")
            .attr("d", lines[i])
            .attr("stroke", function(d) {
              if (_colors != null){ return _colors[i];}
              else{ return "#74736c";}
            });

          // change the y axis
          svg.select(".y.axis")
            .transition()
            .duration(300)
            .ease("quad")
            .call(yAxis);

      });

  }
  return func_lines;

};

// ====================================
// Display or Hide Overlayed Events
// ====================================
func_lines.update_events = function() {
  
  _op = _op == 0 ? 1:0;

  d3.selectAll(".event-line")
    .attr("opacity", _op);

  d3.selectAll(".event-label")
    .attr("opacity", _op);
  
  return func_lines;
};

var _width = 500;
func_lines.width = function(__) {
  if (arguments.length) {
        _width = __;
        //console.log('setted width', _width, __);
        return func_lines;
    }
    return width;
};

var _height = 60;
func_lines.height = function(__) {
  if (arguments.length) {
      _height = __;
      //console.log('setted height', _height);
      return func_lines;
  }
  return _height;
};

var _chart_title = null;
func_lines.chart_title = function(__) {
  if (arguments.length) {
      _chart_title = __;
      return func_lines;
  }
  return _chart_title;
};

var _names = ["num_tweets"];
func_lines.names = function(__) {
  if (arguments.length) {
      _names = __;
      //console.log('setted variables', _names);
      return func_lines;
  }
  return _names;
};

var _colors = null;
func_lines.colors = function(__) {
  if (arguments.length) {
      _colors = __;
      //console.log('setted variables', _colors);
      return func_lines;
  }
  return _colors;
};

var _axis_flag = false;
func_lines.axis_flag = function(__) {
  if (arguments.length) {
      _axis_flag = __;
      //console.log('setted axis', _axis_flag);
      return func_lines;
  }
  return _axis_flag;
};

var _op =0;
var _events = null;
func_lines.events = function(__) {
  if (arguments.length) {
      _events = __;
      //console.log('setted events', _events);
      return func_lines;
  }
  return _events;
};

var _events_div = "";
func_lines.events_div = function(__) {
  if (arguments.length) {
      _events_div = __;
      return func_lines;
  }
  return _events_div;
};

var _fill_line = false;
func_lines.fill_line = function(__) {
  if (arguments.length) {
      _fill_line = __;
      //console.log('setted fill', _fill_line);
      return func_lines;
  }
  return _fill_line;
};

var _transform= null;
func_lines.transform = function(__) {
  if (arguments.length) {
      _transform = __;
      return func_lines;
  }
  return _transform;
};

var _class_style="sparkline";
func_lines.class = function(__) {
  if (arguments.length) {
      _class_style = __;
      return func_lines;
  }
  return _class_style;
};

function colores_google(n) {
  var colores_g = [  "#dd4477", "#66aa00", "#316395", "#994499", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6"];
  return colores_g.slice(0,n+1);
}


function formatDate (dt){
  return new Date(dt);
}

var formatValue = d3.format(".0s");

return func_lines;
}
