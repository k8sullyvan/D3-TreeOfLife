

d3.json("data.json", (function(error, data)
{ 
	if (error != null) {
		console.log("There was an error: " + error)
	}
	onDataSuccess(data) 
}));

function onDataSuccess(data)
{
	// Canary
	// d3.select(".target")  // select the elements that have the class 'target'
	//   .style("stroke-width", 18) // change their style: stroke width is not equal to 8 pixels

	// Setting up some const stuff
	color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))
	format = d3.format(",d")
    width = 975
    radius = width / 2
    arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius / 2)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1 - 1)

	partition = data => d3.partition()
	    .size([2 * Math.PI, radius])
	  (d3.hierarchy(data)
	    .sum(d => d.value)
	    .sort((a, b) => b.value - a.value))
	const root = partition(data);

	// Setting up the sunburst
	const svg = d3.select(".sunburst-svg")
			.attr("width", width)
            .attr("height", width);

	svg.append("g")
	  .attr("fill-opacity", 0.6)
	.selectAll("path")
	.data(root.descendants().filter(d => d.depth))
	.enter().append("path")
	  .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
	  .attr("d", arc)
	.append("title")
	  .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

	svg.append("g")
	  .attr("pointer-events", "none")
	  .attr("text-anchor", "middle")
	  .attr("font-size", 10)
	  .attr("font-family", "sans-serif")
	.selectAll("text")
	.data(root.descendants().filter(d => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
	.enter().append("text")
	  .attr("transform", function(d) {
	    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
	    const y = (d.y0 + d.y1) / 2;
	    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
	  })
	  .attr("dy", "0.35em")
	  .text(d => d.data.name);
}
