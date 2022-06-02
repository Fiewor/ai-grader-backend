// this logic joins text that are part of the same answer
// but are identified/read to be on seperate lines by OCR
const answerReadResult = [
  "1. my name is",
  "and i am such a devleoper that is developing developed applications in a developing nation",

  "a. john is a good",
  "elevator going up and up and up in this wowlrd, there's nothing we can't do",

  "i) believe me, i'm trying but i'm so very far",
  "help me polarize cause where i'm from, there's no sun. out hometown's in the dark",
];
let initialString = "";

const answerReadArray = answerReadResult.reduce((currString, nextString) => {
  const startDelimiter = /^(\d|\w){1,2}[.|)| ]+?/gi;
  const match = startDelimiter.test(nextString);
  //   console.log(match);
  let start, rest;
  if (match) start = nextString;
  else rest = nextString;

  console.log(`${start}${rest}\n`);
}, initialString);

console.log(answerReadArray);
