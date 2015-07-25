var margin = {top: 0, right: 0, bottom: 0, left: 0};
var width = 1042 - margin.left - margin.right,
    height = 681- margin.top - margin.bottom;

// scale이 적용되는 공간 정의
var xScale = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);
var yScale = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);
 
var zoom = d3.behavior.zoom()
    .x(xScale)
    .y(yScale)
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

var svg = d3.select("#map svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    .call(zoom)
    .on("click", mouseClick);

var container = svg.append("g");
var map = container.append("image").attr("xlink:href","img/worldmap.svg")
    .attr("width", 1042)
    .attr("height", 681);
var background = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("stroke", "black")
    .style("fill", "none")
    .style("stroke-width", "1")
    .style("stroke-dasharray","5,5");

function zoomed() {
    var translate = zoom.translate(),
        scale = zoom.scale();
    var tx = Math.min(0, Math.max(width * (1 - scale), translate[0]));
    var ty = Math.min(0, Math.max(height * (1 - scale), translate[1]));

    zoom.translate([tx, ty]);
    container.attr("transform", "translate(" + [tx,ty] + ")scale(" + scale + ")");
}

function mouseClick(d, i) {
    var position = d3.mouse(svg.node()); //<-C
    var translate = zoom.translate();
    var scale = zoom.scale();

    console.log((translate[0] - position[0])/scale);
    console.log((translate[1] - position[1])/scale);
        
    var map = container.append("image").attr("xlink:href","img/marker.png")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", -(translate[0] - position[0])/scale)
    .attr("y", -(translate[1] - position[1])/scale);
}
