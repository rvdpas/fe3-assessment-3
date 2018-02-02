# The amount of refugees that applied for a residence permit in The Netherlands

## Background
For this assignment I had to show multiple interactive graphs, that would show data from an external source. I found a good dataset that I wanted to use pretty quick. I knew I wanted to do something that is relevant, so you know what's going on. When I was watchting the news, I saw a lot of commotion about the amout of refugees that entered the Netherlands. I think this is a really interesting subject to visualize what exactly is going on. I had all these questions flying through my head. How many refugees did enter our country? Where do they all come from? How many did enter our country over the past years? 

## preview
![Preview of the chart](https://github.com/rvdpas/fe3-assessment-3/blob/master/preview.jpg)

## The 'old' dataset
The dataset that I used comes from the site CBS, which is an organisation that collects reliable data for the Dutch government. When I exported the dataset as a csv it was a mess. This is how it looked like:

```
"Geslacht";"Leeftijd";"Nationaliteit";"aantal";"aantal";"aantal";"aantal";"aantal"
"Totaal mannen en vrouwen ";"Totaal leeftijd";"Afghaans ";"455";"450";"2550";"1025";"320"
```

Then I started to clean my data:

```
var header = doc.indexOf("Onderwerpen_1");
  var end = doc.indexOf('\n', header);
  doc = doc.slice(end).trim();
  doc = doc.replace(/  +/g, ' ');
  var data = d3.csvParseRows(doc, map);

  // remove space from nationaliteit value
  data.forEach(function(d) {
    d.nationaliteit = d.nationaliteit.replace(/\s+/g, '');
  });
```

I cleaned it a lot more to make it useful but I changed my mind on how I wanted to visualize my data. To see the rest of the cleaning see the "Extra" section.

## The first data visualisation
I had this idea of a interactive bubble chart. So I build the whole thing adding filters and then I realised that I only had one chart. I checked the assesment rubric and saw the multiple charts were required to get pass the assesment. I had to think what kind of chart I wanted to add. I wanted to build a pie chart, because I hadn't done that for assesment one or two. So I build the pie chart in a local file and started to combine the two charts. I worked, but you didn't get much insight in the visualized data. I was kinda disappointed, so I went back to create more ideas. A bar chart could be a good replacement for the pie and shows more data. But before I started building this time is looked for other options. 

### the 'old' chart
![Preview of the chart](https://github.com/rvdpas/fe3-assessment-3/blob/master/old-vis.jpg)

## The idea
I came accross multiple maps which looked great! I thought, It would be amazing to show where the refugees came from on a real map. If someone says he's from Somalia, I wouldn't know exactly where it is. So a new idea was born and it had everything I wanted, now I only needed to make it work. I searched for more maps examples. After a few hours of research on how topojson and creating maps work, I found [this](http://bl.ocks.org/tomschulze/961d57bd1bbd2a9ef993f2e8645cb8d2) amazing example that had a really good basis for my end project.

## The chart and changes
I took my data from the CBS and manually converted it to JSON. To get this chart working you need to give it a JSON file to calculate the paths for the map. I loaded my data and started to clean up the example. The first thing I did was to combine the functions.js with the index.html. This way I could easely see where which function was being used. I removed functions that were not relevant to me and update some variable names.

One of the functions I deleted, because it is just a helper function to present his data.

```
function sortArrObj(arr,sortkey) {

  sorted_keys = arr.map( function(elem) {return elem[sortkey];}).sort();

  newarr = [];
  for(let key of sorted_keys){
    for(i in arr){
      if(arr[i][sortkey] === key){
        newarr.push(arr[i]);
        continue;
      }
    }
  }

  return newarr;
}
```

The next thing I did was to split the Javascript, CSS and Html in seperated files. I updated variables names to make more clear what they are supposed to hold. At this point I also changed the variables, functions and quotes chaining to the ES6 version. 

ES6 and variable names update

```
// old
var color_na =  d3.rgb("#d4d4d4");
var init_year = 1990;
let data_all = d['Storm'];
.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// new 
const greyMapColor = d3.rgb("#d4d4d4");
const firstYear = 2013;
let dataContainer = d['Asielverzoeken'];
.attr("transform", `translate(${margin.left},${margin.top})`);
```

### Interaction
In the example there already was a slider to show the multiple years. I wanted to add more interaction to gain more insight in the dataset. I thought it would be nice to show how many refugees came per country. So I added a hover function on the countries to show the amount in the top right corner.

```
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
```

The problem with this interaction was that some countries are really small, so it's hard to hover over them. A good way to prevent this problem from happening is to add zoom / pan functionality. I've searched for multiple examples and came accross [this example](https://bl.ocks.org/mbostock/9656675) from Mike Bostock. 

``` 
const g = worldMap.append("g")
	.enter().append("path")
	.on("click", clicked)

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
function reset() {
  worldMap.transition()
    .duration(750)
    .call( zoom.transform, d3.zoomIdentity ); 
}
```

## Used links
- [Dataset cbs](http://statline.cbs.nl/Statweb/publication/?DM=SLNL&PA=83102NED&D1=1&D2=0&D3=0&D4=1-48&D5=16,33,50,67,l&HDR=T,G4&STB=G1,G2,G3&VW=T)
- [map projections](https://github.com/d3/d3-geo-projection)
- [pan and zoom](https://bl.ocks.org/mbostock/9656675)
- [topojson](https://github.com/topojson/topojson)
- [chromatic scale](https://github.com/d3/d3-scale-chromatic)
- [ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_2015_support_in_Mozilla)
- [Enter, update, exit](http://rajapradhan.com/blogs/d3-js-v4-essentials/the-enter-update-exit-pattern/)
- [margin convention](https://bl.ocks.org/mbostock/3019563)
- [d3 scales](https://github.com/d3/d3-scale)
- [object keys](https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Global_Objects/Object/sorted_keys)
- [path bounds](https://stackoverflow.com/questions/25310390/how-does-path-bounds-work)

## Extra
Here I will show how i prepared the old data to make something useful of it: 

```
  // filter the data by row and return month (so delete quarter totals)
  data = data.filter(function (row) {
    return row.maand != 0;
  });

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
      jaar: d[4].substring(0, 4),
      maand: month,
      waarde: parseInt(d[6]),
    }
  }

  // Determine the gender and add the correct values to the variables
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

    // Check if the data belongs to men or women and add one if true
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

  var yearData = Object.keys(year).map(function (a) {
    return [a, year[a]];
  });
  ```