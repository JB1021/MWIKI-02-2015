var margin = {top: 30, right: 30, bottom: 30, left: 30};
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
var map = container.append("image")
    .attr("xlink:href","../images/worldmap.svg")
    .attr("width", width)
    .attr("height", height);
var background = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("stroke", "black")
    .style("fill", "none")
    .style("stroke-width", "1")
    .style("stroke-dasharray","5,5");

var MAP = MAP || {};
MAP.container = container;

function zoomed() {
    var translate = zoom.translate(),
        scale = zoom.scale();
    var tx = Math.min(0, Math.max(width * (1 - scale), translate[0]));
    var ty = Math.min(0, Math.max(height * (1 - scale), translate[1]));
    zoom.translate([tx, ty]);
    container.attr("transform", "translate(" + [tx,ty] + ")scale(" + scale + ")");
}

function mouseClick(d, i) {
    var mousePos = d3.mouse(svg.node());
    var mapLeftTop = zoom.translate();
    var scale = zoom.scale();

    var markerXPos = -(mapLeftTop[0] - mousePos[0])/scale-5;
    var markerYPos = -(mapLeftTop[1] - mousePos[1])/scale-10;

    container.append("image").attr("xlink:href","../images/marker.png")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", markerXPos)
    .attr("y", markerYPos)
    .attr("class", "marker");

    $("#marker-modal").show();
    $("#marker-modal").css({
        "position" : "absolute",
        "top" : mousePos[1]+140+"px",
        "left" : mousePos[0]+30+"px"
    });
    $("#marker-modal").data("markerXPos", markerXPos);
    $("#marker-modal").data("markerYPos", markerYPos);

}
