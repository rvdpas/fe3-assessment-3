// Load csv file as a normal text file so we can clean it
d3.text("data.csv")
.mimeType('text/plain;charset=iso88591')
.get(onload)

function onload(err, doc) {
  if (err) {
    throw err
  }

  // set header of the file (this is text about the data, not the data itself)
  var header = doc.indexOf("Onderwerpen_1");
  var end = doc.indexOf('\n', header);
  doc = doc.slice(end).trim();
  // replace double spaces with a single one
  doc = doc.replace(/  +/g, ' ');
  // parse clean data and save it in data variable
  var data = d3.csvParseRows(doc, map);

  // remove space from nationaliteit value
  data.forEach(function(d) {
    d.nationaliteit = d.nationaliteit.replace(/\s+/g, '');
  });

  // filter the data by row and return month (so delete quarter totals)
  data = data.filter(function (row) {
    return row.maand != 0;
  });

  // create variables
  var ages = {};
  var men = 0;
  var women = 0;
  // Hoeveelheid mannen en vrouwen per leeftijdscategorie
  var agesGenders = {};
  var years = {};
  var year = {};
  var month = {};

  // nog een nieuwe naam voor de functie verzinnen
  function map(d) {
    // create an array to save all the months
    var months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

    // 0 = niet gevonden in months, anders nummer van maand
    month = months.indexOf(d[4].substr(5)) + 1;

    // assign raw data to properties
    return {
      geslacht: d[0],
      leeftijd: d[1],
      nationaliteit: d[2],
      periode: `${d[4].substring(0, 4)}-${month}`,
      // zelfde als backtick hierboven
      // d[4].substring(0, 4) + '-' + month

      // substract from the 4th column (starting with 0) the first four characters to assign the year to the year property
      jaar: d[4].substring(0, 4),
      maand: month,
      // parseint makes sure the string becomes a number
      waarde: parseInt(d[6]),
    }
  }

  // Determine de gender and add the correct values to the variables
  data.forEach(function(d) {
    var gender = d.geslacht;
    // voeg de data van leeftijd toe aan het object ages. De eerste keer is de key nog undefined dus kennen we 0 toe, daarna voegen we de waarde toe aan de key.
    ages[d.leeftijd] = (ages[d.leeftijd] || 0) + d.waarde;

    // Sla de vergelijking op in de variabele
    var splitGender = agesGenders[d.leeftijd] || { "men": 0, "women": 0};

    // Check if the data belongs to men or women and add one if true
    if (gender.includes("Mannen"))  {
      men += d.waarde;
      splitGender.men += d.waarde;
    } else {
      women += d.waarde;
      splitGender.women += d.waarde;
    }

    years[d.periode] = (years[d.periode] || 0) + d.waarde;
    year[d.jaar] = (year[d.jaar] || 0) + d.waarde;
    month[d.maand] = (month[d.maand] || 0) + d.waarde;

    agesGenders[d.leeftijd] = splitGender;
  });

  var svg = d3.select(".Year");
  var margin = {top: 20, right: 20, bottom: 30, left: 40};
  var width = +svg.attr("width") - margin.left - margin.right;
  var height = +svg.attr("height") - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
  var y = d3.scaleLinear().rangeRound([height, 0]);

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var yearData = Object.keys(year).map(function (a) {
    return [a, year[a]];
  });

// Bekijk voor elk de waarde van de array en push ze naar een aparte array om de y Max uit te rekenenn
  var valueList = []
  yearData.forEach(function (values) {
    valueList.push(values[1]);
  });

  x.domain(Object.keys(year))
  y.domain([0, d3.max(valueList)])

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(10))
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .text("Frequency");

  g.selectAll(".bar")
    .data(yearData)
    .enter().append("rect")
    .transition()
      .duration(300)
      .ease(d3.easeLinear)
      .attr("class", "bar")
      .attr("x", function(d) {
        return x(d[0]);
      })
      .attr("y", function(d) {
        return y(d[1]);
      })
      .attr("width", x.bandwidth())
      .attr("height", function(d) {
        return height - y(d[1]);
      })



// // pie
//   var pieSvg = d3.select(".Gender");
//   var width = +pieSvg.attr("width");
//   var height = +pieSvg.attr("height");
//   var radius = Math.min(width, height) / 2;
//   var g = pieSvg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

//   var color = d3.scaleOrdinal(["#98abc5", "#8a89a6"]);

//   var pie = d3.pie()
//     .sort(null)
//     .value(function(d) { return d.gender; });

//   var path = d3.arc()
//     .outerRadius(radius - 10)
//     .innerRadius(0);

//   var label = d3.arc()
//     .outerRadius(radius - 40)
//     .innerRadius(radius - 40);

//   var arc = g.selectAll(".arc")
//     .data(pie([men, women]))
//     .enter().append("g")
//       .attr("class", "arc");

//   arc.append("path")
//     .attr("d", path)
//     .attr("fill", function(d) { return color(d.index); });

//   arc.append("text")
//     // .attr("transform", function(d) { return "translate(" + label.centroid(d.index) + ")"; })
//     .attr("dy", "0.35em")
//     .text(function(d) { return d.data; });
}
