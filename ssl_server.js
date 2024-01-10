require("dotenv").config();

const https = require("https");
const fs = require("fs");
const path = require("path");

const express = require("express");
var cors = require("cors");
var Emitter = require("events");

const connectDB = require("./config/db");

const routerGameV2 = require("./routes/game-v2");
const routerUsersV2 = require("./routes/users-v2");
const routerWordV2 = require("./routes/word-v2");
const routerAuthV2 = require("./routes/auth-v2");
const routerUserMetaData = require("./routes/userMetaData");

const emitter = new Emitter();
emitter.setMaxListeners(0);
connectDB();

const options = {
  key: fs.readFileSync(path.join("api.passphrase.live", "privkey.pem")),
  cert: fs.readFileSync(path.join("api.passphrase.live", "cert.pem")),
  ca: fs.readFileSync(path.join("api.passphrase.live", "chain.pem")),
};

const app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Authorization, Content-Type, Accept"
  );
  next();
});
app.use(cors());

// initialize, get locked games & stats
app.use("/api/v1/game", routerGameV2);

// game, broadcast email, create user, claim reward & get winners
app.use("/api/v1/users", routerUsersV2);

// user's info
app.use("/api/v1/user-meta-data", routerUserMetaData);

// update/create game words (not used), get random words (admin), get words (users)
app.use("/api/v1/words", routerWordV2);

// is operator
app.use("/api/v1/auth", routerAuthV2);

app.get("/api/v1", async (req, res) => {
  try {
    return res.status(200).json({ status: "dev4.1 ssl_server.js OK" });
  } catch (error) {
    return res.status(500).json({ complete: false, result: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello Passphrase Backend!");
});

const PORT = process.env.PORT || 3001;
https.createServer(options, app).listen(PORT);
