const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const Pusher = require("pusher");
const crypto = require("crypto");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// initialise Pusher.
// Replace with your credentials from the Pusher Dashboard
const pusher = new Pusher({
  appId: "1076489",
  key: "c9e5faec99bd08b3cff2",
  secret: "00a08879fbb6e15a06cb",
  cluster: "ap2",
  encrypted: true,
});

// to serve our JavaScript, CSS and index.html
app.use(express.static("./dist/ng-battleship"));

// CORS
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// endpoint for authenticating client
app.post("/pusher/auth", function (req, res) {
  let socketId = req.body.socket_id;
  let channel = req.body.channel_name;
  let presenceData = {
    user_id: crypto.randomBytes(16).toString("hex"),
  };
  let auth = pusher.authenticate(socketId, channel, presenceData);
  res.send(auth);
});

// direct all other requests to the built app view
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./dist/ng-battleship/index.html"));
});

// start server
var port = process.env.PORT || 3000;
app.listen(port, () => console.log("Listening at http://localhost:3000"));
