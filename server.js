require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
var cors = require("cors");
var Emitter = require("events");

const routerGameV2 = require("./routes/game-v2");
const routerUsersV2 = require("./routes/users-v2");
const routerWordV2 = require("./routes/word-v2");
const routerAuthV2 = require("./routes/auth-v2");
const routerUserMetaData = require("./routes/userMetaData");

const emitter = new Emitter();
emitter.setMaxListeners(0);
connectDB();

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

// initialize
app.use("/api/v1/game", routerGameV2);

// users for game play
app.use("/api/v1/users", routerUsersV2);

// user's info
app.use("/api/v1/user-meta-data", routerUserMetaData);

// update or create game words
app.use("/api/v1/words", routerWordV2);

// login
app.use("/api/v1/auth", routerAuthV2);

app.get("/api/v1", async (req, res) => {
  try {
    return res.status(200).json({ status: "dev4.1 server.js OK" });
  } catch (error) {
    return res.status(500).json({ complete: false, result: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello Passphrase Backend!");
});

const PORT = process.env.PORT || 3001;
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`)
);
