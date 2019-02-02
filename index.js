const express = require("express");
require("dotenv").config();
const fetchurl = require("./fetchurl");
const fs = require("fs");
var schedule = require("node-schedule");

var j = schedule.scheduleJob("*/15 * * * *", function() {
  console.log(`Fetching logs! ${new Date()}`);
  fetchurl.fetching();
});
var app = express();

let logs = [];
const loc = process.env.LOCALIZATION;

const readLogs = url => {
  fs.readFile("log.json", function read(err, data) {
    if (err) {
      throw err;
    }
    logs = JSON.parse(data);

    // Invoke the next step here however you like
    savelogs(url); // Or put the next step in a function and invoke it
  });
};

const savelogs = url => {
  // const cut = loc === "dev" ? 4 : 5;
  const utmsString = url.slice(4);
  const utms = utmsString.split("&");
  console.log(utms);
  console.log(url);
  const report = {
    // opener: id,
    timeOpen: new Date()
  };

  utms.map(utm => {
    const key = utm.split("=")[0];
    const value = utm.split("=")[1];
    report[key] = value;
  });

  // console.log(report);

  logs.push(report);

  fs.writeFile("log.json", JSON.stringify(logs), function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
};

app.use(function(req, res, next) {
  // console.log("req.params", req.params);
  console.log("A request was made for the image");
  next();
});

app.get("/tr/", function(req, res) {
  var buf = new Buffer([
    0x47,
    0x49,
    0x46,
    0x38,
    0x39,
    0x61,
    0x01,
    0x00,
    0x01,
    0x00,
    0x80,
    0x00,
    0x00,
    0xff,
    0xff,
    0xff,
    0x00,
    0x00,
    0x00,
    0x2c,
    0x00,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x01,
    0x00,
    0x00,
    0x02,
    0x02,
    0x44,
    0x01,
    0x00,
    0x3b
  ]);
  res.writeHead("200", { "Content-Type": "image/png" });
  // console.log("req.param", req.params.id);
  res.end(buf, "binary");
  // readLogs(req.url);
});

app.get("/", function(req, res) {
  console.log(req.url);
  var fs = require("fs");
  fs.readFile("image.jpeg", function(err, data) {
    res.writeHead("200", { "Content-Type": "image/png" });
    res.end(data, "binary");
  });
});

app.get("/logo1.gif", function(req, res) {
  console.log(req.url);
  fs.readFile("logo1.gif", function(err, data) {
    res.writeHead("200", { "Content-Type": "image/gif" });
    res.end(data, "binary");
  });
  readLogs(req.url);
});

// var server = app.listen(8080, function() {
//   var host = server.address().address;
//   var port = server.address().port;
// });

const PORT = process.env.PORT || 9090;

app.listen(PORT, () => {
  console.log(`Its ${new Date()} Server is running on PORT ${PORT}`);
});
