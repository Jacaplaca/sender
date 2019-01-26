var express = require("express");
const fs = require("fs");
var app = express();

let logs = [];

const readLogs = id => {
  fs.readFile("logs.json", function read(err, data) {
    if (err) {
      throw err;
    }
    logs = JSON.parse(data);

    // Invoke the next step here however you like
    savelogs(id); // Or put the next step in a function and invoke it
  });
};

const savelogs = id => {
  const report = {
    opener: id,
    time: new Date()
  };

  logs.push(report);

  fs.writeFile("logs.json", JSON.stringify(logs), function(err) {
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

app.get("/:id", function(req, res) {
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
  console.log("req.param", req.params.id);
  res.end(buf, "binary");
  readLogs(req.params.id);
});

// app.get('/', function (req, res) {
//   var fs = require('fs');
//   fs.readFile('image.jpeg',function(err,data){
//     res.writeHead('200', {'Content-Type': 'image/png'});
//     res.end(data,'binary');
//   });
// });

// var server = app.listen(8080, function() {
//   var host = server.address().address;
//   var port = server.address().port;
// });

const PORT = process.env.PORT || 9090;

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
