require("dotenv").config();

const PythonShell = require("python-shell");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

// Switch states held in memory
const switches = [];

// Read state from saveState.json, populate switches array
var readableStream = fs.createReadStream("saveState.json");
var data = "";

readableStream.on("data", function(chunk) {
  data += chunk;
});

readableStream.on("end", function() {
  var parsed = JSON.parse(data);

  for (i = 0; i < parsed.switches.length; i++) {
    switches.push(new Switch(parsed.switches[i]));
  }
});

// Switch Model
// Expects an object:{
// id:"sw" + number,
// state: "on" or "off",
// name: any name you want to display. Defaults to "switch"
// }

function Switch(switchValues) {
  this.id = switchValues.id || "1";
  this.state = switchValues.state || "off";
  this.name = switchValues.name || "Switch";
  this.toggle = function() {
    
      this.setState("on");
  };
  this.setState = function(state) {
    var str = state === "on" ? onString(this.id) : offString();
    console.log("str: " + str);
    PythonShell.run(str, function(err) {
      if (!process.env.DEV) {
        if (err) throw err;
      }
    });
    this.state = state;
  };
  // Invokes setState on init to set the switch to its last recalled state.
  this.setState(this.state);
}

// needed due to a quirk with PythonShell
function onString(number) {
  return "./public/python/sound" + number + "_on.py";
}
function offString() {
  return "./public/python/switch_off.py";
}

// Switch Lookup
function getSwitch(string) {
  return switches.filter(function(element) {
    return element.id === string;
  })[0];
}

// Updates saveState.json
function saveState() {
  var formattedState = {
    switches: switches
  };
  fs.writeFile("./saveState.json", JSON.stringify(formattedState), function(
    err
  ) {
    if (err) {
      console.error(err);
    } else {
      let date = new Date();
      console.log(`
${date.toLocaleDateString()} ${date.toLocaleTimeString()} State has been updated
New state: ${JSON.stringify(formattedState)}
`);
    }
  });
}

function runTests() {
  var str = "./public/python/testRelays.py";
  PythonShell.run(str, function(err) {
    if (!process.env.DEV) {
      if (err) throw err;
    }
  });
}

function stopPlayback() {
  var str = offString();
  PythonShell.run(str, function(err) {
    if (!process.env.DEV) {
      if (err) throw err;
    }
  });
}

//Server Configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// If you have a frontend, drop it in the Public folder with an entry point of index.html
app.get("/", function(req, res) {
  console.log("Index page requested");
  res.sendFile("index");
});

// Switch Routes for API
app.get("/api/switches", function(req, res) {
  res.send(switches);
});

app.get("/api/switches/:id", function(req, res) {
  console.log("Getting switch status for sound " + req.params.id);
  var found = getSwitch(req.params.id);
  res.json(found);
});

app.get("/api/test", function(req, res) {
  console.log("Testing switches");
  runTests();
  res.json("{'status': 'ok'}");
});

app.get("/api/off", function(req, res) {
  console.log("Stopping playback");
  stopPlayback();
  console.log("Stopped playback");
  res.json("{'status': 'ok'}");
});

app.post("/api/switches/:id", function(req, res) {
  // For now, uses a simple password query in the url string.
  // Example: POST to localhost:8000/API/switches/sw1?password=test
  if (req.query.password === process.env.PASS) {
    console.log("Toggle switch triggered");
    console.log("Request path: " + req.path)
    console.log("Request body: " + JSON.stringify(req.body))
    console.log("Request query: " + JSON.stringify(req.query))
    var foundSwitch = getSwitch(req.params.id);

    // Optional On / Off command. If not included, defaults to a toggle.

    if (!(req.query.command === "on" || req.query.command === "off")) {
      foundSwitch.toggle();
    } else {
      foundSwitch.setState(req.query.command);
    }

    //saveState();
    console.log("postSwitch " + JSON.stringify(foundSwitch));
    res.json(foundSwitch);
  } else {
    console.log("invalid password");
    res.send("try again");
  }
});

const port = process.env.PORT || 8000;
app.listen(port, function() {
  console.log("Listening on port " + port);
});
