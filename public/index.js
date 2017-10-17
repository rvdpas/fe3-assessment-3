d3.text("data.csv")
.mimeType('text/plain;charset=iso88591')
.get(onload)

function onload(err, doc) {
  if (err) {
    throw err
  }

  // console.log(doc)

  // clean data
  var header = doc.indexOf("Onderwerpen_1");
  var end = doc.indexOf('\n', header);
  doc = doc.slice(end).trim();
  doc = doc.replace(/  +/g, ' ');
  var data = d3.csvParseRows(doc, map);
  data = data.filter(function (row) {
    return row.maand != 0;
  });

  console.log(data[0].leeftijd)

  var ages = {};
  var men = 0;
  var women = 0;
  var agesGenders = {};
  var years = {};
  var year = {};
  var month = {};

  data.forEach(function(d) {
    // console.log(d.geslacht[0])
    var gender = d.geslacht;
    ages[d.leeftijd] = (ages[d.leeftijd] || 0) + d.waarde;

    tmp = agesGenders[d.leeftijd] || { "men": 0, "women": 0};

    // console.log(gender);
    if (gender.includes("Mannen"))  {
      men += d.waarde;
      tmp.men += d.waarde;
      // console.log(men)
    } else {
      women += d.waarde;
      tmp.women += d.waarde;
      // console.log(women)
      // voeg toe aan vrouwen
    }

    years[d.periode] = (years[d.periode] || 0) + d.waarde;
    year[d.jaar] = (year[d.jaar] || 0) + d.waarde;
    month[d.maand] = (month[d.maand] || 0) + d.waarde;

    agesGenders[d.leeftijd] = tmp;
  });
    console.log(men)
    console.log(women)
    console.log(ages)
    console.log(agesGenders)
    console.log(years);
    console.log(year);
    console.log(month);

  // console.log(data)

  // remove space from nationaliteit value
  data.forEach(function(d) {
    d.nationaliteit = d.nationaliteit.replace(/\s+/g, '');
  });
    // console.log(data.Perioden)
    // console.log(Object.values(data.Perioden))

  function map(d) {
    months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

    // 0 = niet gevonden in months, anders nummer van maand
    month = months.indexOf(d[4].substr(5)) + 1;

    return {
      geslacht: d[0],
      leeftijd: d[1],
      nationaliteit: d[2],
      periode: `${d[4].substring(0, 4)}-${month}`,
      // zelfde als backtick hierboven
      // d[4].substring(0, 4) + '-' + (month)


      jaar: d[4].substring(0, 4),
      maand: month,
      waarde: parseInt(d[6]),
    }
  }


  var svg = d3.select(".Year"),
      margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(Object.keys(year));
  y.domain([0, 15000]);

  var whatever = Object.keys(year).map(function (a) {
    return [a, year[a]];
  });

  console.log(whatever);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");

  g.selectAll(".bar")
    .data(whatever)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d[0]); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d[1]); });


  var svg = d3.select(".Gender"),
      width = +svg.attr("width"),
      height = +svg.attr("height"),
      radius = Math.min(width, height) / 2,
      g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var color = d3.scaleOrdinal(["#98abc5", "#8a89a6"]);

  var pie = d3.pie()
      .sort(null)
      .value(function(d) { return d.population; });

  var path = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var label = d3.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

  var arc = g.selectAll(".arc")
    .data(pie([men, women]))
    .enter().append("g")
      .attr("class", "arc");

  arc.append("path")
      .attr("d", path)
      .attr("fill", function(d) { return color(d.index); });

  arc.append("text")
      .attr("transform", function(d) { return "translate(" + label.centroid(d.index) + ")"; })
      .attr("dy", "0.35em")
      .text(function(d) { return d.data; });
}
