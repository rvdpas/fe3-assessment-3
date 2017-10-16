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

  console.log(data)


  function map(d) {
    console.log(d)
  // var total = [];
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
      // aantal: total.push(d[5,6,7,8,9,10,11])

    }
  }
}
