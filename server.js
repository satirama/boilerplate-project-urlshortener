'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require("body-parser");
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, {
  useMongoClient: true
});

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});

var schema = new mongoose.Schema({ original_url: 'string', short_url: 'number' });
var urlCollection = mongoose.model('url', schema);

app.post("/api/shorturl/new/", function(req, res) {
  const url = req.body.url;
  dns.lookup(url, function (err, result) {
    if (err) {
      res.send({"error":"invalid URL, try again."});
    }
    else {
      var short = Math.ceil(Math.random() * 100);
      urlCollection.findOne({short_url: short}, function(err,result) {
        if (result == null) {
          urlCollection.create({ original_url: url, short_url: short}, function (err, small) {
            if (err) 
              res.send({"error": "An error has occurred"});
            else
              res.send({ original_url: url, short_url: short});
          });
        }
        else {
          res.send({"error": "An error has occurred. Try again."});
        }
      });
    }
  });
});

app.get("/api/shorturl/:short_name", function(req,res) {
  console.log(req.params.short_name);
  urlCollection.findOne({short_url: req.params.short_name}, function(err,result){
    if (err) {
      res.send({"error": "invalid short url name, please verify"});
    } 
    else {
      console.log(result);
      res.redirect('https://' + result.original_url);
      res.end();
    }
  });
});
