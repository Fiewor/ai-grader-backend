// each new element in readText should begin with a number or letter (uppercase or lowercase)
// that number (1, a, i etc) should be used as an id also in the keyphrase section

const answerSheet = {
  page: [
    {
      id: 1,
      text: "1. democracy is the government of the people, by the people",
      phrases: ["democracy", "government", "people"],
    },
    {
      id: 2,
      text: "2. ask not what your country can do for you, ask what you can do for your country",
      phrases: ["ask", "country"],
    },
    {
      id: 3,
      text: "3. no matter who you are, no matter what you do, there's always an asian better than you",
      phrases: ["matter", "asian", "better"],
    },
  ],
};

const markSheet = {
  page: [
    {
      id: 1,
      text: "1. democracy is the government of the people, by the people and for the people",
      phrases: ["democracy", "government", "people"],
    },
    {
      id: 2,
      text: "2. ask not what your country can do for you, ask what you can do for your country, dear patriot",
      phrases: ["ask", "country", "dear", "patriot"],
    },
    {
      id: 3,
      text: "3. no matter who you are, no matter what you do, there's always an asian kid better than you",
      phrases: ["matter", "asian", "kid", "better"],
    },
  ],
};

module.exports = { answerSheet, markSheet };
