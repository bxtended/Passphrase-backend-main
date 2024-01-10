const User = require("../models/User");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config({ path: "./config/config.env" });

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      completed: false,
      error: err.message,
    });
  }
}

exports.authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(202).json({ completed: false, message: "Enter all fields" });

    const user = await User.findOne({ email }); //pot pitfal

    if (!user) return res.status(202).json({ completed: false, message: "Login fail" });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(202).json({ completed: false, message: "Login fail" });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.SECRET);

      res.status(201).json({
        completed: true,
        message: "user authenticates successfully",
        user: user,
        token,
      });
    }
  } catch (err) {
    res.status(500).json({
      completed: false,
      error: err.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      completed: false,
      error: err.message,
    });
  }
};

exports.authCheck = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const user = jwt.verify(token, process.env.SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ login: false, result: error.message });
  }
}
