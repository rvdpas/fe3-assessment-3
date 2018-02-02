// Global variables
const greyMapColor = d3.rgb("#d4d4d4");
const quantiles = [0, 0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1]; // steps for the legend
const firstYear = 2013;
const headline = "Aantal verblijfsaanvragen in Nederland in: ";
const width = 1400;
const height = 500;
const worldMap = d3.select("body").insert("svg")
  .attr("id", "map")
  .attr("height", height)
  .attr("width", width)

// type of map used (full list: https://github.com/d3/d3-geo-projection)
const path = d3.geoPath(d3.geoRobinson());

// create slider
d3.select("body").append("input")
  .attr("type", "range")
  .attr("min", "2013")
  .attr("max", "2017")
  .attr("value", firstYear)
  .attr("id", "year");

// Create title above map
d3.select("body").insert("h2", ":first-child")
  .text(`${headline}${firstYear}`);

// define margins
const margin = {
  top: 50, 
  right: 10, 
  bottom: 50, 
  left: 30
};

// set bar chart width and height
const barsWidth = width - margin.left - margin.right;
const barsHeight = 200 - margin.top - margin.bottom;

// create x axis bar chart
const x = d3.scaleBand()
  .rangeRound([0, barsWidth])
  .padding(.1);

// create y axis bar chart
const y = d3.scaleLinear().range([barsHeight, 0]);

// create a wrapper around the bar chart
const barChart = d3.select("body")
  .append("svg")
    .attr("id", "bars")
    .attr("width", barsWidth + margin.left + margin.right)
    .attr("height", barsHeight + margin.top + margin.bottom)
  .append("g")
    .attr("class", "bars")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// load data
d3.json("data.json", (error, d) => {
  if (error) throw error;

  let dataContainer = d['Asielverzoeken'];
  let data = dataContainer[firstYear];
  let color = calcColorScale(data);

  // load map data and render it
  d3.json("world.json", (error, worldmap) => {
    if (error) throw error;

   const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);
        
    worldMap
      .call(zoom) 
      .on("click", resetZoom);
        
    const g = worldMap.append("g")
      .attr("class", "countries")
      .selectAll("path")
      .data(topojson.feature(worldmap, worldmap.objects.world).features)
      .enter().append("path")
        .attr("d", path)
        .attr("id", d => d.id)
        .call(fillMap, color, data)
        .on("click", clicked)
        .on("mouseover", function(e) {
          // create country info div
          d3.select("body").append("div")
            .attr("class", "country-info")

          const objectToArray = [];
          for (let key of Object.keys(data)) {
            objectToArray.push({'id':key, 'value': data[key]})
          }

          const country = [];
          for (let i = 0; i < objectToArray.length; i++) {
            if (objectToArray[i].id === e.id) {
              country.push(objectToArray[i].id, objectToArray[i].value);
            }
          }

          if ( !country.length) {
            return;
          }

          d3.select("body").append("div")
            .attr("class", "country-info")
            .html(`
              <div class="country-info__item">Land: ${country[0]}</div>
              <div class="country-info__item">Aantal: ${country[1]}</div>
            `)
        })
      
      // Call the legend and the bars create functions.
      renderLegend(color, data);
      renderBars(color, data);

    //  zoom in on click
    function clicked(d) {
      const bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];
    
        worldMap.transition()
          .duration(750)
          .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );
    }

    function zoomed() {
      g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
      g.attr("transform", d3.event.transform);
    }

    // zoom out 
    function resetZoom() {
      worldMap.transition()
        .duration(750)
        .call( zoom.transform, d3.zoomIdentity ); 
    }
  }); 

  // update the data if the slider is used
  d3.select("#year").on("input", function() {
    let upd_color = calcColorScale(dataContainer[this.value]);
    updateMap(upd_color, dataContainer[this.value]);
    renderLegend(upd_color, dataContainer[this.value]);
    renderBars(upd_color, dataContainer[this.value]);
  });
});

function fillMap(selection, color, data) {
  selection
    .attr("fill", d => { 
      return typeof data[d.id] === 'undefined' ? greyMapColor : d3.rgb(color(data[d.id])); 
    });
}

function setPathTitle(selection, data) {
  selection
    .text(d => { 
      return "" + d.id + ", " + (typeof data[d.id] === 'undefined' ? 'N/A' : data[d.id]); 
    });
}

function updateMap(color, data) {
  // fill paths
  d3.selectAll("svg#map path").transition()
    .delay(100)
    .call(fillMap, color, data);

  // update path titles
  d3.selectAll("svg#map path title")
    .call(setPathTitle, data);

  // update headline
  d3.select("h2").text(headline + d3.select("#year").node().value);
}

// render the legend
function renderLegend(color, data) {
  worldMap.append("g")
    .attr("class", "legend");
  worldMap.append("g")
    .attr("class", "legend__title")
    .append("text");
    
  let mapHeight = +d3.select("svg#map").attr("height");
  let legendItems = pairQuantiles(color.domain()); // match color with legend items

  let legend = d3.select("svg#map g.legend").selectAll("rect")
    .data(color.range());

  // when the years change remove the old lengends if necessary.
  legend.exit().remove();

  // add new and existing ones here
  legend.enter()
    .append("rect")
  .merge(legend)
    .attr("width", "20")
    .attr("height", "20")
    .attr("y", (d, i) => (mapHeight - 29) - 25 * i)
    .attr("x", 30)
    .attr("fill", d => d3.rgb(d))
    .on("mouseover", d => { legendMouseOver(d, color, data); })
    .on("mouseout", () => { legendMouseOut(color, data); });

    const text = d3.select("g.legend").selectAll("text");

    // append text to legend items
    text.data(legendItems)
      .enter().append("text").merge(text)
      .attr("y", (d, i) => (mapHeight - 14) - 25 * i)
      .attr("x", 60)
      .text(d => d);  

     d3.select("svg#map g.legend__title text")
      .text("Aantal verblijfsaanvragen")
      .attr("x", 30)
      .attr("y", 300);
}

// create the bars
function renderBars(color, data) {
  // turn data into array of objects
  var arrayOfObjects = [];

  for (let key of Object.keys(data)) {
    arrayOfObjects.push({'id':key, 'value': data[key]})
  }

  x.domain(arrayOfObjects.map(d => d.id));
  y.domain([0, d3.max(Object.values(data), d => d)]);

  d3.select("svg#bars g.axis").remove();

  let axis = d3.select("svg#bars").append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(${30},${(barsHeight + margin.top)})`)
    .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

  let bars = d3.select("svg#bars g.bars").selectAll("rect").data(arrayOfObjects);

  bars.exit().remove();

  bars.enter().append("rect")
    .merge(bars)
    .attr("fill", d => color(d.value))
    .attr("x", d => x(d.id))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.value))
    .attr("height", d => barsHeight - y(d.value));

  let annot = d3.select("svg#bars g.bars")
    .selectAll("text")
      .data(arrayOfObjects);

  annot.exit().remove();

  annot.enter().append("text")
    .merge(annot)
    .text(d => d3.format(",")(d.value))
    .attr("class", "barlabel")
    .attr("x", d => x(d.id) + x.bandwidth() / 2)
    .attr("y", d => y(d.value) - 5);
}

function calcColorScale(data) {
  // get values and sort
  let data_values = Object.values(data).sort( function(a, b){ return a-b; });

  const quantilesCalc = quantiles.map(elem => {
    return Math.ceil(d3.quantile(data_values, elem));
  });

  let scale = d3.scaleQuantile()
    .domain(quantilesCalc)
    .range(d3.schemeReds[(quantilesCalc.length) - 1]);

  return scale;
}

// Legend hover in
function legendMouseOver(color_key, color, data) {
  // cancels ongoing transitions (e.g., for quick mouseovers)
  d3.selectAll("svg#map path").interrupt();

  // then we also need to refill the map
  d3.selectAll("svg#map path")
    .call(fillMap, color, data);

  // and fade all other regions
  d3.selectAll(`svg#map path:not([fill = ${d3.rgb(color_key)}])`)
    .attr("fill", greyMapColor);
}

// Legend hover out
function legendMouseOut(color, data) {
  // refill entire map
  d3.selectAll("svg#map path").transition()
    .delay(100)
    .call(fillMap, color, data);
}

// helper function to calculate the legend values
// pairs neighboring elements in array of quantile bins
function pairQuantiles(arr) {

  let pairNumbersOfArray = [];
  for (let i = 0; i < arr.length - 1; i++) {

    // allow for closed intervals (depends on d3.scaleQuantile)
    // assumes that neighboring elements are equal
    if (i == arr.length - 2) {
      pairNumbersOfArray.push([arr[i], arr[i+1]]);
    }
    else {
      pairNumbersOfArray.push([arr[i], arr[i+1]-1]);
    }
  }

  pairNumbersOfArray = pairNumbersOfArray.map(elem => { 
    return elem[0] === elem[1] ?
    d3.format(",")(elem[0]) :
    d3.format(",")(elem[0]) + " - " + d3.format(",")(elem[1]);
  });

  return pairNumbersOfArray;
}
