const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// sendFile will go here
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/staticSunburst.js', function(req, res) {
  res.sendFile(path.join(__dirname, '/staticSunburst.js'));
});
app.get('/zoomableSunburst.js', function(req, res) {
  res.sendFile(path.join(__dirname, '/zoomableSunburst.js'));
});
app.get('/zoomableSunburstCsv.js', function(req, res) {
  res.sendFile(path.join(__dirname, '/zoomableSunburstCsv.js'));
});
app.get('/style.css', function(req, res) {
  res.sendFile(path.join(__dirname, '/style.css'));
});
app.get('/data.json', function(req, res) {
  res.sendFile(path.join(__dirname, '/data.json'));
});
app.get('/data.csv', function(req, res) {
  res.sendFile(path.join(__dirname, '/data.csv'));
});
app.get('/CsvOfLife.csv', function(req, res) {
  res.sendFile(path.join(__dirname, '/CsvOfLife.csv'));
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})