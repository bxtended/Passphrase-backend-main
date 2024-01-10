const { isValidUser } = require("../utils/sign");
const { isWhitelisted } = require("../utils/subgraph");

exports.isOperator = async (req, res) => {
  try {
    // validation
    if (!req.headers?.authorization)
      throw Error("Validation Failed: authorization isn't set");

    // is valid user
    const auth = req.headers.authorization;
    const [isAllowed, address] = await isValidUser(auth);
    if (!isAllowed) throw Error("Validation Failed: user isn't authorized");

    // is user whitelisted
    const isUserWhitelisted = await isWhitelisted(address.toLowerCase());
    if (!isUserWhitelisted)
      throw Error("Validation Failed: user isn't an operator");

    return res.status(200).send({ completed: true, status: "OK" });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ completed: false, status: "error", message: "bad request" });
  }
};
