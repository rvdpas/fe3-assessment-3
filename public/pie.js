(function() {
  var width = 1500;
  var height = 800;

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
        return radiusScale(d.aantal) + 1;
      }))

    var radiusScale = d3.scaleSqrt()
    var colorCircles = d3.scaleOrdinal(d3.schemeCategory10);

    d3.text("data.csv")
    .mimeType('text/plain;charset=iso88591')
    .get(onload)

    function onload(err, doc) {
      if (err) {
        throw err;
      }

      // set header of the file (this is text about the data, not the data itself)
      var header = doc.indexOf("Onderwerpen_1");
      var end = doc.indexOf('\n', header);
      doc = doc.slice(end).trim();
      doc = doc.replace(/  +/g, ' ');
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
    var totalPersonsAYear = {};
    var countries = {}

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
      var nationality = d.nationaliteit;
      // voeg de data van leeftijd toe aan het object ages. De eerste keer is de key nog undefined dus kennen we 0 toe, daarna voegen we de waarde toe aan de key.
      ages[d.leeftijd] = (ages[d.leeftijd] || 0) + d.waarde;

      if (! countries[nationality]) {
        countries[nationality] = { Mannen: 0, Vrouwen: 0 };
      } else {
        countries[nationality][gender] += d.waarde;
      }

      // Sla de vergelijking op in de variabele
      var splitGender = agesGenders[d.leeftijd] || { "men": 0, "women": 0};

      // Check if the data belongs to men or women and add value if true
      if (gender.includes("Mannen")) {
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

    function getDataByCountry(data, year) {
      var dataByCountry = {};
      data.forEach(function (entry) {
        if (year && year != entry.jaar) {
          return;
        }

        if (! dataByCountry[entry.nationaliteit]) {
          dataByCountry[entry.nationaliteit] = {
            aantal: 0,
            mannen: 0,
            vrouwen: 0,
            nationaliteit: entry.nationaliteit
          };
        }

        dataByCountry[entry.nationaliteit].aantal += parseInt(entry.waarde);
        dataByCountry[entry.nationaliteit].mannen += entry.geslacht == 'Mannen' ? parseInt(entry.waarde) : 0;
        dataByCountry[entry.nationaliteit].vrouwen += entry.geslacht == 'Vrouwen' ? parseInt(entry.waarde) : 0;
      });
      dataByCountry = Object.values(dataByCountry)
      console.log(dataByCountry)
      return dataByCountry;
    }

    // var dataByCountry = getDataByCountry(data, 2013);


    var selectOptions = document.getElementById('select');
    console.log(selectOptions)

    function yearFilter () {
      return this.value;
    }

    selectOptions.addEventListener('change', yearFilter);

    var dataByCountry = getDataByCountry(data, yearFilter())
    console.log(dataByCountry)

    // var yearData = Object.keys(year).map(function(a) {
    //   return [a, year[a]];
    // });

    radiusScale.domain([
      d3.min(dataByCountry, function(d) {
        return +d.aantal;
      }),
      d3.max(dataByCountry, function(d) {
        return +d.aantal;
      })
    ])
    .range([10, 80])

        var circles = svg.selectAll('.bubble')
          .data(dataByCountry)
          .enter()
            .append('circle')
            .attr('class', 'bubble')
            .attr('r', function(d) {
              return radiusScale(d.aantal)
            })
            .style("fill", function(d) {
              return colorCircles(d.category)
            })
            .text(function(d) {
              return d.aantal;
            })
            .on("mouseover", function(d) {
              tooltip.transition()
                .duration(200)
                .style("opacity", .9);
              tooltip.html(`${d.nationaliteit} <br> ${d.aantal}`)
                .style("top", (d3.event.pageY-10)+"px")
                .style("left",(d3.event.pageX+10)+"px");
            })
            .on("mouseout", function(d) {
              tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            })

            // var updateCircles = svg.selectAll('.bubble')
            //   .on("change", yearFilter)
            //   .data(getDataByCountry(data, yearFilter))
            //     updateCircles.exit().remove();//remove unneeded circles
            //     updateCircles.enter().append("circle")


      // Define the tooltip for the tooltip
      var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        simulation.nodes(dataByCountry)
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
