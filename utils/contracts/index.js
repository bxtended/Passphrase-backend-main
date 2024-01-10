const Web3 = require("web3");
const passPhraseABI = require("./abis/passPhrase.json");

const web3 = new Web3(process.env.RPC_URL);

const passPhraseContract = () => {
  try {
    return new web3.eth.Contract(passPhraseABI, process.env.CONTRACT_ADDRESS);
  } catch (e) {
    console.log("contract", e);
  }
};

module.exports = { passPhraseContract };
