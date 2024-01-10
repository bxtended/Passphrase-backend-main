function distributePrize(numPlayers, ethPrice) {
  let originPrizePool = numPlayers * ethPrice;
  // Creators and Investors share: 20%
  let prizePool = originPrizePool * 0.8;
  // first
  let firstPlace = originPrizePool * 0.5;
  // reward array
  let rewards = [firstPlace];
  // top 30% of winners
  let winningPlayers = numPlayers * 0.3;
  let remainerPool = originPrizePool * 0.3;

  // let originPrizePool = numPlayers * ethPrice;
  // // Creators and Investors share: 20%
  // let prizePool = originPrizePool * 0.8;
  // // first
  // let firstPlace = prizePool * 0.5;
  // // reward array
  // let rewards = [firstPlace];
  // // top 30% of winners
  // let winningPlayers = numPlayers * 0.3;
  // let remainerPool = prizePool * 0.3;

  // calculate unit
  let sum = 0;
  let unit = 0;
  for (let i = 2; i <= winningPlayers; i++) sum += 1 / i;

  unit = remainerPool / sum;

  // calculate rewards
  for (let j = 2; j <= winningPlayers; j++) {
    let place = unit / j;
    place = Math.ceil(place * 10 ** 20) / 10 ** 20;
    rewards.push(place);
  }
  return rewards;
}

function getTop30PercRewards(numPlayers = 100, gamePriceInEth = 0.1) {
  const arr = [];

  let originPrizePool = numPlayers * gamePriceInEth;

  //distribute
  let prizeRewards = distributePrize(numPlayers, gamePriceInEth);
  let total = 0;
  for (let i = 0; i < prizeRewards.length; i++) {
    let prizeReward = prizeRewards[i];
    let rewardPercent = (prizeReward / originPrizePool) * 100;
    rewardPercent = Math.round((rewardPercent + Number.EPSILON) * 1000) / 1000;

    total += prizeReward;

    arr.push({
      prize: Number(Number(prizeReward).toFixed(6)),
      percentage: rewardPercent,
    });
  }

  return {
    userRewards: arr,
    totalPerc: (total / originPrizePool) * 100,
    totalPrizeSum: total,
    totalPoolAmount: originPrizePool,
  };
}

module.exports = {
  getTop30PercRewards,
};
