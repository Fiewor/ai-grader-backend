// this logic joins text that are part of the same answer
// but are identified/read to be on seperate lines by OCR
const answerReadResult = [
  "1. my name is",
  "and i am such a develooper that is developing developed applications in a developing nation",

  "a. john is a good",
  "elevator going up and up and up in this wowlrd, there's nothing we can't do",

  "i) believe me, i'm trying but i'm so very far",
  "help me polarize cause where i'm from, there's no sun. our hometown's in the dark",
];

const answerReadArray = answerReadResult.reduce(
  (currString, nextString) => `${currString} ${nextString}`
);

console.log(
  answerReadArray
  // .split(/(\d|\w){1}[.|)]/gi)
  // .filter((string) => string !== "")
);

// module.exports = answerReadArray;
