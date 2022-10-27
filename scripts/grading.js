// grading.js

// const { answerSheet, markSheet } = require("../dummyData");
const synonyms = require("synonyms");

const grader = async (doc1, doc2) => {
  let doc1Details = await doc1.page.textByNumber;
  let doc2Details = await doc2.page.textByNumber;

  let totalScore = 0,
    totalPointsAwardable = 0,
    pointsAwardable,
    arr = [],
    id,
    score,
    leniencyScore = 1;

  for (const block1 of doc1Details) {
    for (const block2 of doc2Details) {
      console.log("block2 ", block2.phrases.length);
      // check that id is the same
      // so, keyPhrase for question 1 is only compared with keyPhrase for answer 1
      // if (block1.id === block2.id) {
      let grade = 0;
      // if points/marks are specified at the end of the marking guide,
      // then use those as the maximum mark attainable for that question's answer,
      // if not use the length i.e number of keyphrases present in the particular answer
      let pointsCheck = /\(\d+[ ]?((mark)|(point)s?)/.exec(block2.text);

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
      console.log("pointsAwardable: ", pointsAwardable);
      // every keyphrase in the student's sheet for a particular question is present in the marking guide answer for that question
      if (block1.phrases.every((phrase) => block2.phrases.includes(phrase))) {
        grade = pointsAwardable; // award full marks for that question
      } else {
        block1.phrases.forEach((answerPhrase) => {
          block2.phrases.forEach((markingGuidePhrase) => {
            if (answerPhrase === markingGuidePhrase) {
              grade++;
            }
            // ! Logic for comparing keywords to synonyms
            // else {
            //   // check if the student's answer (keyword) is a synonym to a marking guide (keyword) answer
            //   let synonymObject = synonyms(answerPhrase);
            //   if (synonymObject) {
            //     if (synonymObject.v) {
            //       for (let word of synonymObject.v) {
            //         if (word === markingGuidePhrase) grade++;
            //       }
            //     }
            //     if (synonymObject.r) {
            //       for (let word of synonymObject.r) {
            //         if (word === markingGuidePhrase) grade++;
            //       }
            //     }
            //     if (synonymObject.n) {
            //       for (let word of synonymObject.n) {
            //         if (word === markingGuidePhrase) grade++;
            //       }
            //     }
            //   } else {
            //     console.log(`No synonym found for keyword`);
            //   }
            // }
          });
        });
      }
      // ! Leniency computation - logic for adding extra 'benevolent' marks
      // if (grade > Math.round(pointsAwardable / 2) - leniencyScore) {
      //   score = Math.round(grade + (grade / pointsAwardable));
      // }
      // if (grade < Math.round(pointsAwardable / 2) - leniencyScore) {
      //   score = grade + leniencyScore;
      // }
      score = grade; // score for a particular question
      totalScore += +score; // total score for all questions in a page

      id = block1.id;
      console.log(
        `Score for question ${block1.id}: ${score}/${pointsAwardable}`
      );
      arr.push({
        id,
        score,
        pointsAwardable,
      });
      // }
    }
  }

  console.log(
    `Total score attained in this page: ${totalScore}/${totalPointsAwardable}`
  );
  return { arr, totalScore, totalPointsAwardable };
};

// console.log(grader(answerSheet, markSheet));
module.exports = grader;
