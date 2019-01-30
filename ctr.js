const fs = require("fs");

let content = [];
let lines = [];
let goodLogs = [];
// First I want to read the file
fs.readFile("./sf.txt", "utf8", function read(err, data) {
  if (err) {
    throw err;
  }
  content = data;

  // Invoke the next step here however you like
  // console.log(content); // Put all of the code here (not the best solution)
  onlyWithString(); // Or put the next step in a function and invoke it
});

function onlyWithString() {
  content
    .toString()
    .split("\n")
    .forEach(function(line, index, arr) {
      if (index === arr.length - 1 && line === "") {
        return;
      }
      // console.log(index + " " + line);
      line.indexOf("?who=") !== -1 && makeObj(line);
      // line.contains("?who=") && lines.push(line);
    });
  clean(lines);
  // console.log(lines);
  console.log(goodLogs);
  // onlyWithString(lines)
  fs.writeFile("logctr.json", JSON.stringify(goodLogs), function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

const clean = lines => {
  for (let line of lines) {
    const same = goodLogs.filter(
      goodLine => goodLine.ip === line.ip && goodLine.time === line.time
    );
    if (same.length === 0) {
      goodLogs.push(line);
    }
  }
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

const savelogs = id => {
  const report = {
    opener: id,
    time: new Date()
  };

  logs.push(report);

  fs.writeFile("log.json", JSON.stringify(logs), function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
};

// const onlyWithString = lines => {
//   var regex = /\[([^\)]+)\]/g;
// var found = paragraph.match(regex);
//
// console.log(found);
// }
