const Word = require("../models/Word");

const wordController = {
  get: async(req, res) => {
    const { query: {limit} } = req;
    try {
      const words = await Word.aggregate([{$sample: {size: parseInt(limit)}}]);
      const arrWord = [];
      for(let i = 0; i < words.length; i++) {
        arrWord.push(words[i].a);
      }
      return res.status(200).json(arrWord);
    } catch (error) {
      return res.status(500).json({ complete: false, result: error.message });
    }

  }
}

module.exports = wordController;
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

// exports.registerNewUser = async (req, res) => {
//   try {
//     const { name, email, password, walletAddress, twitterURL, contactNumber } = await req.body;

//     const user = await User.findOne({ email });

//     if (user) {
//       return res.status(201).json({
//         completed: false,
//         message: "Email already in use"
//       });
//     }
//     if (!validator.validate(email))
//       throw Error("Invalid email format, try again.");
//     const newUser = new User({
//       name,
//       email,
//       password,
//       walletAddress, 
//       twitterURL, 
//       contactNumber
//     });

//     const salt = bcrypt.genSaltSync(10);

//     if (password) newUser.password = bcrypt.hashSync(password, salt);

//     const token = jwt.sign({ id: newUser._id }, process.env.SECRET, {
//       expiresIn: "2h",
//     });

//     await newUser.save();

//     return res.status(201).json({
//       completed: true,
//       user: newUser,
//       token,
//     });
//   } catch (err) {
//     res.status(500).json({
//       completed: false,
//       error: err.message,
//     });
//   }
// };
