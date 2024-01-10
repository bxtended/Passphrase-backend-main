
const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  const token = req.header("authorization");
  if (!token) {
    return res.status(401).json({
      error: "No token, rejected (Try reloading!)",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(200).json({ complete: false, msg: "Token is not valid" });
  }
};
