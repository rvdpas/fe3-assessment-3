d3.text("data.csv")
.mimeType('text/plain;charset=iso88591')
.get(onload)

function onload(err, doc) {
  if (err) {
    throw err
  }

  console.log(doc)

  // clean data
  var header = doc.indexOf("Onderwerpen_1");
  var end = doc.indexOf('\n', header);
  doc = doc.slice(end).trim();
  doc = doc.replace(/  +/g, '');
  // doc = doc.replace(/ +/g, ',');
  var data = d3.csvParseRows(doc, map);

  console.log(data)

  // remove comma from nationaliteit value
  data.forEach(function(d) {
    d.nationaliteit = d.nationaliteit.replace(/,/g, '');
  });
    // console.log(data.Perioden)
    // console.log(Object.values(data.Perioden))


  function map(d) {
    // var months = [];

    return {
      geslacht: d[0],
      leeftijd: d[1],
      nationaliteit: d[2],
      jaar: d[4],
      waarde: d[6],
    }
  }
}
