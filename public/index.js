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
}
