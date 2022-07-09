// grading.js

const { answerSheet, markSheet } = require("../dummyData");
const synonyms = require("synonyms");

const grader = async (doc1, doc2) => {
  let doc1Details = await doc1.page.textByNumber;
  let doc2Details = await doc2.page.textByNumber;

  let totalScore = 0,
    totalPointsAwardable = 0,
    arr = [],
    id,
    score,
    leniencyScore = 1;

  for (const block1 of doc1Details) {
    for (const block2 of doc2Details) {
      // check that id is the same
      // so, keyPhrase for question 1 is only compared with keyPhrase for answer 1
      if (block1.id === block2.id) {
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
          pointsAwardable = block2.phrases.length;
        }

        totalPointsAwardable += +pointsAwardable;
        if (block1.phrases.every((phrase) => block2.phrases.includes(phrase))) {
          grade = pointsAwardable;
        } else {
          block1.phrases.forEach((blockphrase1, blockphrase1Index) => {
            block2.phrases.forEach((block2phrase, blockphrase1Index) => {
              if (blockphrase1 === block2phrase) {
                grade++;
              } else {
                let synonymObject = synonyms(blockphrase1);
                if (synonymObject) {
                  if (synonymObject.v) {
                    for (let word of synonymObject.v) {
                      if (word === block2phrase) grade++;
                    }
                  }
                  if (synonymObject.r) {
                    for (let word of synonymObject.r) {
                      if (word === block2phrase) grade++;
                    }
                  }
                  if (synonymObject.n) {
                    for (let word of synonymObject.n) {
                      if (word === block2phrase) grade++;
                    }
                  }
                } else {
                  console.log(`No synonym found for keyword`);
                }
              }
            });
          });
        }
        if (grade > Math.round(pointsAwardable / 2) - leniencyScore) {
          score = Math.round(grade + grade / pointsAwardable);
        }
        if (grade < Math.round(pointsAwardable / 2) - leniencyScore) {
          score = grade + leniencyScore;
        }
        score = grade;
        totalScore += +score;

        // all keywords in a particular (answer) block are exactly the same words as those in marking guide
        // and number or words in answer document are exactly the same as the number of words in marking guide
        // if (block1.phrases.length === block2.phrases.length) {
        // }

        id = block1.id;
        console.log(
          `Score for question ${block1.id}: ${score}/${pointsAwardable}`
        );
        arr.push({
          id,
          score,
          pointsAwardable,
        });
      }
    }
  }
  console.log(
    `Total score attained in this page: ${totalScore}/${totalPointsAwardable}`
  );
  return { arr, totalScore, totalPointsAwardable };
};

// console.log(grader(answerSheet, markSheet));

module.exports = grader;
