// this logic joins text that are part of the same answer
// but are identified/read to be on seperate lines by OCR
const testArray = [
  "1. Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris",

  "a. Ornare quam viverra orci sagittis eu volutpat odio facilisis",
  "Turpis egestas pretium aenean pharetra magna ac placerat",

  "i) Non blandit massa enim nec dui nunc mattis enim",
  "Nunc lobortis mattis aliquam faucibus purus in massa",
];

const joinSame = (arr) => {
  let finalArr = [];

  const splitByDelimiter = arr
    .reduce((currString, nextString) => `${currString} ${nextString}`)
    .split(/(\d|\w){1}[.|)]/gi)
    .filter((string) => string !== "");

  for (let i = 0; i < splitByDelimiter.length; i++) {
    (i === 0 || i % 2 === 0) &&
      finalArr.push(`${splitByDelimiter[i]}. ${splitByDelimiter[i + 1]}`);
  }

  return finalArr;
};

// console.log(joinSame(testArray));

module.exports = joinSame;
