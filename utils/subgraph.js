const { default: axios } = require("axios");

const passphrase_api =
  "https://api.thegraph.com/subgraphs/name/billpass/passphrase";

const queryUserBaught = (gameId, userAddress) => `
{
    users(
      where:{
      address:"${userAddress}",
      game:"${gameId}"
      }) {
      id
      timestamp
    }
}`;

const queryIsOperator = (userAddress) => `
{
    operators(
      where:{
      id:"${userAddress}",
      }) {
      authorized
    }
}`;

const queryIsGameExist = (gameId) => `
{
    games(where:{
      id:"${gameId}"
    }) {
      id
    }
}`;

const queryGamePrice = (gameId) => `
{
  game(id:"${gameId}") {
    gamePrice
  }
}`;

const queryNoOfUsers = (gameId) => `
{
  game(id:"${gameId}") {
    noOfUsers
  }
}`;

const queryTotalPlayers = (gameId) => `
{
  game(id:"${gameId}") {
    totalPlayers
  }
}`;

const queryChainId = () => `
{
  infos{
    chainId
  }
}`;

const queryContact = () => `
{
  infos{
    contract
  }
}`;

const queryUsersNft = (gameId) => `
{
  users(
    where:{ gameId:${gameId} }
    orderBy:timestamp,
    orderDirection:asc
    ){
    address
    nft
    timestamp
  }
}`;

const queryIsClaimed = (gameId, userAddress) => `
{
  users(where:{
   address:"${userAddress}",
   gameId: ${gameId}
   }){
     isClaimed
   }
 }`;

const queryGameDetail = (gameId) => `
 {
  games(where:{id:${gameId}}) {
    users (
      orderBy:timestamp,
      orderDirection:desc
    ) {
      timestamp
    }
    noOfUsers
    totalPlayers
  }
}`;

async function doesUserBaught(gameId, userAddress) {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryUserBaught(gameId, userAddress),
    });
    const { data } = res.data || {};
    if (data) {
      return data?.users.length > 0;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

async function userBaughtTimestamp(gameId, userAddress) {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryUserBaught(gameId, userAddress),
    });
    const { data } = res.data || {};
    if (data) {
      return Number(data?.users[0]?.timestamp) * 1000;
    }
  } catch (e) {
    console.log(e);
  }
  return 0;
}

async function isGameExist(gameId) {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryIsGameExist(gameId),
    });
    const { data } = res.data || {};
    if (data) {
      return data?.games.length > 0;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

async function isWhitelisted(userAddress) {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryIsOperator(userAddress),
    });
    const { data } = res.data || {};
    if (data) {
      const { operators } = data || {};
      if (operators?.length === 0) return false;
      return operators[0]?.authorized;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

async function fetchGamePrice(gameId) {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryGamePrice(gameId),
    });
    const { data } = res.data || {};
    if (data) {
      const { game } = data || {};

      return Number(game?.gamePrice) / 1e18;
    }
  } catch (e) {
    console.log(e);
  }
  return 0;
}

async function fetchNoOfUsers(gameId) {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryNoOfUsers(gameId),
    });
    const { data } = res.data || {};
    if (data) {
      const { game } = data || {};

      return Number(game?.noOfUsers);
    }
  } catch (e) {
    console.log(e);
  }
  return 0;
}
async function fetchTotalPlayers(gameId) {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryTotalPlayers(gameId),
    });
    const { data } = res.data || {};
    if (data) {
      const { game } = data || {};

      return Number(game?.totalPlayers);
    }
  } catch (e) {
    console.log(e);
  }
  return 0;
}

async function fetchChainId() {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryChainId(),
    });
    const { data } = res.data || {};
    if (data) {
      const { infos } = data || {};

      return infos[0]?.chainId;
    }
  } catch (e) {
    console.log(e);
  }
  return 0;
}

async function fetchContract() {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryContact(),
    });
    const { data } = res.data || {};
    if (data) {
      const { infos } = data || {};

      return infos[0]?.contract;
    }
  } catch (e) {
    console.log(e);
  }
  return "0x";
}

async function fetchIsUserClaimed(gameId, userAddress) {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryIsClaimed(gameId, userAddress),
    });
    const { data } = res.data || {};
    if (data) {
      const { users } = data || {};

      return users[0]?.isClaimed;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

async function fetchUsersNft(gameId) {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryUsersNft(gameId),
    });
    const { data } = res.data || {};
    if (data) {
      const { users } = data || {};

      return users;
    }
  } catch (e) {
    console.log(e);
  }
  return [];
}

async function fetchIsGameStartedForUsers(gameId) {
  try {
    const res = await axios.post(passphrase_api, {
      query: queryGameDetail(gameId),
    });
    const { data } = res.data || {};
    if (data) {
      const { games } = data || {};

      if (games && games[0]?.noOfUsers === games[0]?.totalPlayers) {
        const gameStartAt = Number(games[0]?.users[0]?.timestamp) + 60 * 3;
        // Number(games[0]?.users[0]?.timestamp) + 60 * 60 * 24;
        if (gameStartAt <= ~~(Date.now() / 1000)) {
          return [true, 0];
        }

        return [false, gameStartAt - ~~(Date.now() / 1000)];
      }
    }
    return [false, 0];
  } catch (e) {
    console.log(e);
  }
  return [false, 0];
}

module.exports = {
  doesUserBaught,
  userBaughtTimestamp,
  isWhitelisted,
  isGameExist,
  fetchGamePrice,
  fetchNoOfUsers,
  fetchTotalPlayers,
  fetchChainId,
  fetchContract,
  fetchUsersNft,
  fetchIsUserClaimed,
  fetchIsGameStartedForUsers,
};
