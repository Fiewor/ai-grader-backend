// grading.js

// const { answerSheet, markSheet } = require("../dummyData"); <- for testing

const grader = async (doc1, doc2) => {
  let doc1Details = await doc1.page.textByNumber;
  let doc2Details = await doc2.page.textByNumber;

  let totalScore = 0,
    totalPointsAwardable = 0,
    pointsAwardable,
    arr = [],
    id,
    score;

  let i = 0;

  while (i < doc2Details.length) {
    let block1 = doc1Details[i],
      block2 = doc2Details[i];
    // check that id is the same
    // so, keyPhrase for question 1 is only compared with keyPhrase for answer 1

    // if (block1.id === block2.id) {
    let grade = 0;
    // if points/marks are specified at the end of the answer in marking guide, use as the maximum mark attainable for that question
    // if not use the phrases length i.e number of keyphrases present in the particular answer
    let pointsCheck = /\(\d+[ ]?((mark)|(point)s?)/.exec(block2.text);
    console.log("pointsCheck: ", pointsCheck);
    if (pointsCheck) {
      pointsAwardable = pointsCheck[0]
        .split("")
        .filter((char) => !isNaN(char))
        .join("");
    } else {
      console.log("length of block: ", block2.phrases.length);
      pointsAwardable = block2.phrases.length;
    }

    totalPointsAwardable += +pointsAwardable;

    // every keyphrase in the student's sheet for a particular question is present in the marking guide answer for that question
    if (block1.phrases.every((phrase) => block2.phrases.includes(phrase))) {
      grade = pointsAwardable; // award full marks for that question
    } else {
      block1.phrases.forEach((answerPhrase) => {
        block2.phrases.forEach((markingGuidePhrase) => {
          if (answerPhrase === markingGuidePhrase) grade++;
        });
      });
    }
    // if students got more than half of the keywords in a particular answer, award such student full marks
    if (grade > Math.floor(pointsAwardable / 2)) {
      score = pointsAwardable;
    } else {
      // !TO-DO: be lenient i.e. add extra benevolent marks based on range of keywords
      //! e.g. student got 40% of expected keywords, add 2 marks to score
      // score = grade + leniencyScore;
    }
    score = grade; // score for a particular question
    totalScore += +score; // total score for all questions in a page

    // ! incremement original id by 1 before assigning to id
    // ! this is to transofrm orignal 0-index to normal 1-indexing
    // id = ++block1.id;
    id = i;
    console.log(`Score for question ${block1.id}: ${score}/${pointsAwardable}`);
    arr.push({
      id,
      score,
      pointsAwardable,
    });
    i++;
  }

  console.log(
    `Total score attained in this page: ${totalScore}/${totalPointsAwardable}`
  );
  return { arr, totalScore, totalPointsAwardable };
};

// console.log(grader(answerSheet, markSheet));
module.exports = grader;
