// each new element in readText should begin with a number or letter (uppercase or lowercase)
// that number (1, a, i etc) should be used as an id also in the keyphrase section

const answerSheet = {
  page: {
    textByNumber: [
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
  },
};

const markSheet = {
  page: {
    textByNumber: [
      {
        id: 1,
        text: "(1. democracy is the government of the people, by the people and for the people(10 marks)",
        phrases: ["democracy", "government", "people"],
      },
      {
        id: 2,
        text: "2. ask not what your country can do for you, ask what you can do for your country, dear patriot (2 point)",
        phrases: ["ask", "country", "dear", "patriot"],
      },
      {
        id: 3,
        text: "3. no matter who you are, no matter what you do, there's always an asian kid better than you (5 marks)",
        phrases: ["matter", "asian", "kid", "better"],
      },
    ],
  },
};

module.exports = { answerSheet, markSheet };
