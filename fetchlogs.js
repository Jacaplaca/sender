const ftpClient = require("ftp-client");
require("dotenv").config();
const fs = require("fs");
const zlib = require("zlib");
const readline = require("readline");

let content = [];
let goodLogs = [];

const conf = {
  host: process.env.FTP_URL,
  port: 21,
  user: process.env.FTP_LOGIN,
  password: process.env.FTP_PASS
};
const options = {
  logging: "basic"
};
const client = new ftpClient(conf, options);

// module.exports = function() {
//   //It returns an object with all of the server methods
//   console.log("module exports");
//   return {
//     fetching: connection()
//   };
// };

exports.connection = function() {
  console.log("connection");
  client.connect(function() {
    client.download(
      "/",
      "logs/",
      {
        overwrite: "older"
      },
      function(result) {
        console.log("result", result);
        // const fileName = result?
        readFiles(result.downloadedFiles);
      }
    );
  });
};

// const connection = () => {
//
// };

const readFiles = files => {
  console.log(files);
  for (let file of files) {
    read(file.slice(2));
  }
};

const read = file => {
  const all = [];
  const gzFileInput = fs.createReadStream(`logs/${file}`);
  const gunzip = zlib.createGunzip();

  let lineCount = 0;

  readline
    .createInterface({
      input: gunzip
    })
    .on("line", line => {
      line.indexOf("?who=") !== -1 && all.push(makeObj(line));
      line.indexOf("?who=") !== -1 && lineCount++;
    })
    .on("close", () => {
      console.log({ lineCount });
      save();
    });

  gzFileInput.on("data", function(data) {
    gunzip.write(data);
  });
  gzFileInput.on("end", function() {
    gunzip.end();
  });
};

// const clean = lines => {
//   for (let line of lines) {
//     const same = goodLogs.filter(
//       goodLine => goodLine.ip === line.ip && goodLine.when === line.when
//     );
//     if (same.length === 0) {
//       goodLogs.push(line);
//     }
//   }
// };

const save = line => {
  fs.readFile("./all.json", "utf8", function read(err, data) {
    if (err) {
      throw err;
    }
    if (data) {
      content.push(JSON.parse(data)[0]);
    }

    fs.writeFile("all.json", JSON.stringify(content), function(err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    });
  });
};

const makeObj = line => {
  console.log("odpalam makeObj()", line);
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
    const day = Object.assign({
      ip: ip[0],
      when,
      ...utmsObj,
      date: new Date()
    });
    if (content.length > 0) {
      const same = content.filter(x => x.ip === ip[0] && x.when === when);
      same.length === 0 && content.push(day);
    } else {
      content.push(day);
    }

    // console.log(found);
  }
  // return utmsObj;
};
