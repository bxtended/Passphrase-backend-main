const NFT = require("../models/NFT");

const NFTController = {
  create: async (req, res) => {
    try {
      const { id } = req.user;
      const { name, image, price, status } = req.body;
      const newNFT = NFT({ name, image, price, status, user: id });
      const result = await newNFT.save();

      return res.status(200).json({ complete: true, result: result });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  get: async (req, res) => {
    try {
      const nfts = await NFT.find(req.query);
      return res.status(200).json({ complete: true, result: nfts });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const {id} = req.params;
      const nfts = await NFT.findByIdAndUpdate(id, req.body,{new: true});
      return res.status(200).json({ complete: true, result: nfts });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const {id} = req.params;
      const nfts = await NFT.findByIdAndDelete(id);
      return res.status(200).json({ complete: true, result: nfts });
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }
  }

}


module.exports = NFTController;
// exports.updateBalance = async (req, res) => {
//   try {
//     var balance = { balance: req.body.balance };

//     var filter = { _id: req.params.id };

//     var newOne = await User.findOneAndUpdate(filter, balance, {
//       new: true,
//     });
//     res.json({
//       message: "Balance updated successfully",
//       user: newOne,
//     });
//   } catch (err) {
//     res.status(500).json({
//       error: err,
//     });
//   }
// };

// exports.updateEmail = async (req, res) => {
//   try {
//     var email = { email: req.body.email };
//     var filter = { _id: req.params.id };
//     console.log(filter);
//     const user = await User.findOne(email);

//     if (user) throw Error("Email already in use");
//     if (!validator.validate(email.email)) {
//       throw Error("Email is invalid");
//     }
//     var newOne = await User.findOneAndUpdate(filter, email, {
//       new: true,
//     });
//     res.status(200).json({
//       message: "Email updated successfully",
//       user: newOne,
//     });
//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//     });
//   }
// };

exports.registerNewUser = async (req, res) => {
  try {
    const { name, email, password, walletAddress, twitterURL, contactNumber } = await req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(201).json({
        completed: false,
        message: "Email already in use"
      });
    }
    if (!validator.validate(email))
      throw Error("Invalid email format, try again.");
    const newUser = new User({
      name,
      email,
      password,
      walletAddress,
      twitterURL,
      contactNumber
    });

    const salt = bcrypt.genSaltSync(10);

    if (password) newUser.password = bcrypt.hashSync(password, salt);

    const token = jwt.sign({ id: newUser._id }, process.env.SECRET, {
      expiresIn: "2h",
    });

    await newUser.save();

    return res.status(201).json({
      completed: true,
      user: newUser,
      token,
    });
  } catch (err) {
    res.status(500).json({
      completed: false,
      error: err.message,
    });
  }
};
