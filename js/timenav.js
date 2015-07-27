
var navWidth = 1042 - margin.left - margin.right,
    navHeight = 200 - margin.top - margin.bottom;

var navX = d3.scale.linear()
    .domain([1500, 1700])
    .range([0, width]);

var navY = d3.scale.linear()
    .domain([-height / 2, height / 2])
    .range([height, 0]);

var navXAxis = d3.svg.axis()
    .scale(navX)
    .orient("bottom")
    .tickSize(-height);

var navZoom = d3.behavior.zoom()
    .x(navX)
    .y(navY)
    .scaleExtent([1, 1])
    .on("zoom", zoomzoom);

var timenav = d3.select("#timenav svg")
    .attr("width", navWidth + margin.left + margin.right)
    .attr("height", navHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(navZoom);

timenav.append("g")
    .attr("class", "x axis")
    .call(navXAxis);

function zoomzoom() {
  var navTranslate = d3.event.translate;
  var navDomain = navX.domain();
  console.log(navTranslate[0]);
  
  if(navDomain[1]>2000){
  	navX.domain([1800,2000]);
  	navZoom.translate([-1480, 0]);
  }

  if(navDomain[0]<1500){
  	navX.domain([1500,1700]);
  	navZoom.translate([0, 0]);
  }

  timenav.select(".x.axis").call(navXAxis);
}