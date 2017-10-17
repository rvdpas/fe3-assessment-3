d3.text("data.csv")
.mimeType('text/plain;charset=iso88591')
.get(onload)

function onload(err, doc) {
  if (err) {
    throw err
  }

  var header = doc.indexOf("Onderwerpen_1")
  var end = doc.indexOf('\n', header)
  doc = doc.slice(end).trim()
  doc = doc.replace(/ +/g, ',')
  var data = d3.csvParseRows(doc, map)

  // remove comma from nationaliteit value
  data.forEach(function(d) {
    d.nationaliteit = d.nationaliteit.replace(/,/g, '');
  });

  console.log(data);

  function map(d) {
    return {
      nationaliteit: d[2],
      geslacht: d[3],
      januari2014: d[5],
      februari2014: d[6],
      maart2014: d[7],
      april2014: d[8],
      mei2014: d[9],
      juni2014: d[10],
      juli2014: d[11],
      augustus2014: d[12],
      september2014: d[13],
      oktober2014: d[14],
      november2014: d[15],
      december2014: d[16],
      januari2015: d[17],
    }
  }
}
