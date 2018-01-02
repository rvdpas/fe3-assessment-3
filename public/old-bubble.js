(function() {
  var width = 500;
  var height = 500;

  var svg = d3.select('#chart')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', 'translate(0,0)')

    // center the bubbles and space them with collide
    var simulation = d3.forceSimulation()
      .force('x', d3.forceX(width / 2).strength(0.5))
      .force('y', d3.forceY(height / 2).strength(0.5))
      .force('collide', d3.forceCollide(function(d) {
        return radiusScale(d.sales) + 1;
      }))

    var radiusScale = d3.scaleSqrt()
    var colorCircles = d3.scaleOrdinal(d3.schemeCategory10);

    d3.queue()
      .defer(d3.csv, 'sales.csv')
      .await(ready)

      function ready(error, datapoints) {
        radiusScale.domain([
          d3.min(datapoints, function(d) {
            return +d.sales;
          }),
          d3.max(datapoints, function(d) {
            return +d.sales;
          })
        ])
        .range([10, 80])

        var circles = svg.selectAll('.artist')
          .data(datapoints)
          .enter()
            .append('circle')
            .attr('class', 'artist')
            .attr('r', function(d) {
              return radiusScale(d.sales)
            })
            .style("fill", function(d) { return colorCircles(d.category)})
            .on("mouseover", function(d) {
              tooltip.transition()
                .duration(200)
                .style("opacity", .9);
              tooltip.html(`${d.name} <br> ${d.sales}`)
                .style("top", (d3.event.pageY-10)+"px")
                .style("left",(d3.event.pageX+10)+"px");
            })
            .on("mouseout", function(d) {
              tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            })

      // Define the tooltip for the tooltip
      var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        simulation.nodes(datapoints)
          .on('tick', ticked)

        function ticked() {
          circles
            .attr('cx', function(d) {
              return d.x;
            })
            .attr('cy', function(d) {
              return d.y;
            })
        }

      }
})();
