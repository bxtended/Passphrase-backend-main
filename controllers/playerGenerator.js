 const createPlayers = async (numberPlayer) => {
    const players = [];
    for (let i = 0; i < numberPlayer; i++) {
        const username = i + 1 ;
        players.push({username});
    }
    return players;
}
// function generateString() {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let result = '';
//     const charactersLength = characters.length;
//     for (let i = 0; i < 6; i++) {
//         result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }

//     return result;
// }

// function shuffle(arr) {
//     const shuffledArray = arr.sort(() => {
//         return 0.5 - Math.random()
//     });
//     return shuffledArray;
// }

// const clueList = [
//     {
//         key: 0,
//         clue: "1st in PassPhrase"
//     },
//     {
//         key: 1,
//         clue: "2nd in PassPhrase"
//     },
//     {
//         key: 2,
//         clue: "3th in PassPhrase"
//     },
//     {
//         key: 3,
//         clue: "4th in PassPhrase"
//     },
//     {
//         key: 4,
//         clue: "5th in PassPhrase"
//     },
//     {
//         key: 5,
//         clue: "6th in PassPhrase"
//     },
//     {
//         key: 6,
//         clue: "7th in PassPhrase"
//     },
//     {
//         key: 7,
//         clue: "8th in PassPhrase"
//     },
//     {
//         key: 8,
//         clue: "9th in PassPhrase"
//     },
//     {
//         key: 9,
//         clue: "10th in PassPhrase"
//     },
//     {
//         key: 10,
//         clue: "11th in PassPhrase"
//     },
//     {
//         key: 11,
//         clue: "12th in PassPhrase"
//     },
//     {
//         key: -1,
//         clue: "Not in PassPhrase"
//     },
// ]
module.exports = {createPlayers}