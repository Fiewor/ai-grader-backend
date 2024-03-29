// this logic joins text that are part of the same answer
// but are identified/read to be on seperate lines by OCR
const testArray = [
  "10) Lorem ipsum dolor sit amet, consectetur adipiscing elit,",
  "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris",

  "a) Ornare quam viverra orci sagittis eu volutpat odio facilisis",
  "Turpis egestas pretium aenean pharetra magna ac placerat",

  "ii) Non blandit massa enim nec dui nunc mattis enim",
  "Nunc lobortis mattis aliquam faucibus purus in massa",
];

export default (arr: string[]): string[] => {
  let finalArr: string[] = [];

  const splitByDelimiter = arr
    .reduce((currString, nextString) => `${currString} ${nextString}`, "")
    .split(/(\d|\w){1}[)]/gi)
    .filter((string) => string !== "");

  console.log(splitByDelimiter);

  for (let i = 0; i < splitByDelimiter.length; i++) {
    (i === 0 || i % 2 === 0) &&
      finalArr.push(`${splitByDelimiter[i]}) ${splitByDelimiter[i + 1]}`);
  }

  return finalArr;
};
