root = undefined

d3.csv("data.csv", function(error, vCsvData)
{ 
	if (error != null) {
		console.log("There was an error: " + error)
	}
	onDataSuccess(vCsvData);
});

function onDataSuccess(asdfData)
{
	data = d3.stratify()(asdfData);
	// Canary
	// d3.select(".target")  // select the elements that have the class 'target'
	//   .style("stroke-width", 18) // change their style: stroke width is not equal to 8 pixels
	// Setting up some const stuff
	color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))
	format = d3.format(",d")
	width = 900
	radius = width / 6
	arc = d3.arc()
	.startAngle(d => d.x0)
	.endAngle(d => d.x1)
	.padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
	.padRadius(radius * 1.5)
	.innerRadius(d => d.y0 * radius)
	.outerRadius(d => d.y1 * radius - 1)

	partition = data => {
	  const root = d3.hierarchy(data)
	      .sum(d => {
	      	return (d.children == undefined) ? 1 : 0
	      })
	      //.sort((a, b) => b.data.size - a.data.size);
	  return d3.partition()
	      .size([2 * Math.PI, root.height + 1])
	    (root);
	}
	root = partition(data);

	// Setting up the sunburst
	root.each(d => d.current = d);

	const svg = d3.select(".sunburst-svg")
			.attr("width", width)
            .attr("height", width);

	const g = svg.append("g")
	  .attr("transform", `translate(${width / 2},${width / 2})`);

	const path = g.append("g")
	.selectAll("path")
	// .data(root.descendants().slice(1))
	.data(root.descendants().filter(d => d.depth))
	.enter().append("path")
	  .attr("fill", d => { 
	  	while (d.depth > 1) 
	  		d = d.parent; 
	  	return color(d.data.id); 
	  })
	  .attr("fill-opacity", d => labelColor(d))
	  .attr("d", d => arc(d.current));

	path.filter(d => d.children)
	  .style("cursor", "pointer")
	  .on("click", clicked);

	path.append("title")
	  .text(d => `${d.ancestors().map(d => d.data.data.name).reverse().join("/")}\n${format(d.depth)}`);

	const label = g.append("g")
	  .attr("pointer-events", "none")
	  .attr("text-anchor", "middle")
	  .style("user-select", "none")
	.selectAll("text")
	// .data(root.descendants().slice(1))
	.data(root.descendants().filter(d => d.depth))
	.enter().append("text")
	  .attr("dy", "0.35em")
	  .attr("fill-opacity", d => +labelVisible(d.current))
	  .attr("transform", d => labelTransform(d.current))
	  .text(d => {
	  	return d.data.data.name
	  });

	const parent = g.append("circle")
	  .datum(root)
	  .attr("r", radius)
	  .attr("fill", "none")
	  .attr("pointer-events", "all")
	  .on("click", clicked);

    function clicked(p, pid) {
	    parent.datum(p.parent || root);

	    root.each(d => d.target = {
	      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
	      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
	      y0: Math.max(0, d.y0 - p.depth),
	      y1: Math.max(0, d.y1 - p.depth)
	    });

	    const t = g.transition().duration(750);

	    // Transition the data on all arcs, even the ones that aren’t visible,
	    // so that if this transition is interrupted, entering arcs will start
	    // the next transition from the desired position.
	    path.transition(t)
	        .tween("data", d => {
	          const i = d3.interpolate(d.current, d.target);
	          return t => d.current = i(t);
	        })
	      .filter(function(d) {
	        return +this.getAttribute("fill-opacity");
	      })
	        .attr("fill-opacity", d => labelColor(d))
	        .attrTween("d", d => () => arc(d.current));

	    label.filter(function(d) {
	        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
	      }).transition(t)
	        .attr("fill-opacity", d => +labelVisible(d.target))
	        .attrTween("transform", d => () => labelTransform(d.current));
	}

	function labelColor(d) {
		return (0.7 - (d.depth - 1) * 0.02);
	}

	function labelVisible(d) {
	return d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
	}

	function labelTransform(d) {
	const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
	const y = (d.y0 + d.y1) / 2 * radius;
	return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
	}
}