const { ecsign } = require("ethereumjs-util");
const { getAddress, keccak256, solidityPack } = require("ethers/lib/utils");
const Web3 = require("web3");

const AUTH_MESSAGE = process.env.AUTH_MESSAGE;

async function isValidUser(auth) {
  if (auth && auth.includes("-")) {
    let authMsg = `${AUTH_MESSAGE}\n\nDay: ${~~(
      Date.now() /
      (1000 * 60 * 60 * 24)
    )}`;
    // let authMsg = `${AUTH_MESSAGE}-${~~(Date.now() / (1000 * 60 * 60 * 24))}`;

    let split = auth.split("-");
    let signature = split[0];
    let userAddress = split[1];

    let web3 = new Web3();

    let signing_address = await web3.eth.accounts.recover(authMsg, signature);

    if (signing_address.toLowerCase() === userAddress.toLowerCase())
      return [true, signing_address.toLowerCase()];
  }

  return [false, ""];
}

// async function isAdmin(auth) {

//   if (auth && auth.includes("-")) {
//     let authMsg = process.env.AUTH_MESSAGE;

//     let split = auth.split("-");
//     let signature = split[0];
//     let userAddress = split[1];

//     let web3 = new Web3();

//     let signing_address = await web3.eth.accounts.recover(authMsg, signature);

//     if (
//       signing_address.toLowerCase() === userAddress.toLowerCase() &&
//       signing_address.toLowerCase() === ADMIN_PK.toLowerCase()
//     )
//       return [true, signing_address];
//   }
//   return [false, ""];
// }

const getSignature = (
  userAddress,
  gameId,
  rank,
  rewardAmount,
  chainid,
  contractAddress
) => {
  const _userAddress = getAddress(userAddress);
  const _gameId = gameId.toString();
  const _rank = rank.toString();
  const _rewardAmount = rewardAmount.toString();
  const _chainid = chainid.toString();
  const _contractAddress = getAddress(contractAddress);

  const key = process.env.SIGNER;

  const eventSignature = keccak256(
    solidityPack(
      ["address", "uint", "uint", "uint", "uint", "address"],
      [_userAddress, _gameId, _rank, _rewardAmount, _chainid, _contractAddress]
    )
  );

  let str = "\x19Ethereum Signed Message:\n32";

  const message = keccak256(
    solidityPack(["string", "bytes32"], [str, eventSignature])
  );

  const { v, r, s } = ecsign(
    Buffer.from(message.slice(2), "hex"),
    Buffer.from(key.slice(2), "hex")
  );

  const signatures =
    "0x" + r.toString("hex") + s.toString("hex") + v.toString(16);

  return signatures;
};

module.exports = {
  isValidUser,
  getSignature,
};
