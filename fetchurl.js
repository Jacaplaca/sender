require("dotenv").config();
const fs = require("fs");
// const fetch = require("node-fetch");
let base64 = require("base-64");
// let headers = new fetch.Headers();
const username = process.env.LOGIN;
const password = process.env.PASS;
const domain = "swiadomafirma.pl";

const url = "http://www.dziewano.linuxpl.info:2222/CMD_SHOW_LOG";

var request = require("request");

let content = [];
let lines = [];
let goodLogs = [];

var options = {
  method: "GET",
  url: url,
  qs: { domain, type: "log" },
  headers: {
    // "Postman-Token": "7b652361-5667-4867-8584-92eac5259100",
    "cache-control": "no-cache",
    Authorization: "Basic " + base64.encode(username + ":" + password)
  }
};

exports.fetching = function() {
  console.log("fetching");
  request(options, function(error, response, body) {
    if (error) throw new Error(error);

    // console.log(body);
    onlyWithString(body);
  });
};

const onlyWithString = body => {
  body
    .toString()
    .split("\n")
    .forEach(function(line, index, arr) {
      if (index === arr.length - 1 && line === "") {
        return;
      }
      // console.log(index + " " + line);
      console.log(line);
      line.indexOf("?who=") !== -1 && makeObj(line);
      // line.contains("?who=") && lines.push(line);
    });
  clean(lines);
  // console.log(lines);
  console.log(goodLogs);
  // onlyWithString(lines)
  // fs.writeFile("logctr.json", JSON.stringify(goodLogs), function(err) {
  //   if (err) {
  //     return console.log(err);
  //   }
  // });
  save();
};

const save = () => {
  fs.readFile("./all.json", "utf8", function read(err, data) {
    if (err) {
      throw err;
    }
    if (data) {
      goodLogs.push(JSON.parse(data)[0]);
    }

    fs.writeFile("all.json", JSON.stringify(goodLogs), function(err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    });
  });
};

const makeObj = line => {
  let utmsObj = {};
  const whenReg = /\[(.*?)\]/g;
  const when = whenReg.exec(line)[1];
  //const whenReg = /\[([^\)]+)\]/g;
  //const when = line.match(whenReg);
  const ipReg = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  const ip = line.match(ipReg);
  const whoReg = /\GET \/\?([^\)]+) HT/g;
  const who = line.match(whoReg);
  // console.log(who);
  if (who) {
    const utmsReg = /\?([^\)]+) /g;
    const utmsString = who[0].match(utmsReg)[0].slice(1, -1);
    const utms = utmsString.split("&");
    utms.map(utm => {
      const key = utm.split("=")[0];
      const value = utm.split("=")[1];
      utmsObj[key] = value;
    });

    // const comp = compReg.exec(line)[1];
    const newLine = Object.assign({ ip: ip[0], when, ...utmsObj });
    lines.push(newLine);
    // console.log(found);
  }
};

const clean = () => {
  for (let line of lines) {
    const same = goodLogs.filter(goodLine => goodLine.who === line.who);
    if (same.length === 0) {
      line.who.indexOf("%") !== -1 || goodLogs.push(line);
    }
  }
};
