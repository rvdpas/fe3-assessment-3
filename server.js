const express = require('express');
const request = require('request');
const path = require('path');

const app = express();

// set static path
app.use(express.static(path.join(__dirname, 'public')));

// render index.html on /
app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/test', function (req, res) {
  res.render('test.html');
});

// assign a port to listen on
app.listen(3000, function() {
	console.log('Server started on port 3000...');
});
