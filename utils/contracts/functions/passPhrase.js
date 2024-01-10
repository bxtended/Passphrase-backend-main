const { passPhraseContract } = require("..");

const isGameExistFromContract = async (gameId) => {
  try {
    let contract = passPhraseContract();
    return (
      Number(gameId) <=
      Number(await contract?.methods.totalGamesCreated().call())
    );
  } catch (e) {
    console.log("totalGamesCreated", e);
    return false;
  }
};

const isGameGoinToStart = async (gameId) => {
  try {
    let contract = passPhraseContract();
    return (
      Number(
        (await contract?.methods.gameDetails(gameId).call())?.gameStartTime
      ) > 0
    );
  } catch (e) {
    console.log("gameDetails", e);
    return false;
  }
};

module.exports = { isGameExistFromContract, isGameGoinToStart };
