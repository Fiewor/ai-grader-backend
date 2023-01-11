// import { answerSheet, markSheet } from "../dummyData"; //<- for testing

interface Document {
  page: {
    textByNumber: {
      id: number | 0;
      text: string | "";
      phrases: string[];
    }[];
  };
}

const grader = async (doc1: Document, doc2: Document) => {
  let doc1Details = doc1["page"]["textByNumber"];
  let doc2Details = doc2["page"]["textByNumber"];

  let totalScore: number = 0,
    totalPointsAwardable: number = 0,
    pointsAwardable: number,
    arr: {
      id: number;
      score: number;
      pointsAwardable: number;
    }[] = [],
    id: number,
    score: number;

  let i = 0;

  while (i < doc2Details.length) {
    let block1 = doc1Details[i],
      block2 = doc2Details[i];

    //! TO-DO: add logic that checks that id is the same so that keyPhrase for question 1 is only compared with keyPhrase for answer 1
    // if (block1.id === block2.id) {

    let grade = 0;
    // if points/marks are specified at the end of the answer in marking guide, use as the maximum mark attainable for that question
    // if not use the phrases length i.e number of keyphrases present in the particular answer
    let pointsCheck = /\(\d+[ ]?((mark)|(point)s?)/.exec(block2.text);
    console.log("pointsCheck: ", pointsCheck);
    if (pointsCheck) {
      pointsAwardable = pointsCheck[0]
        .split("")
        .filter((char) => !isNaN(+char))
        .join("") as unknown as number;
    } else {
      pointsAwardable = block2.phrases.length;
    }

    totalPointsAwardable += +pointsAwardable;

    if (block1.phrases.length && block2.phrases.length) {
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
    }
    // student did not answer that question
    if (block2.phrases.length && !block1.phrases.length) {
      grade = 0;
    }
    // lecturer somehow has no keyphrases for that answer // <- maybe AI didn't identify text due to illegible handwriting or keyphrase extraction API had an issue
    if (block1.phrases.length && !block2.phrases.length) {
      //! TO-DO: notify lecturer beforehand that there was no keyphrase identified in a particular answer
      // * fix(temp): give student perfect score
      grade = pointsAwardable;
    }
    // no keyphrase from both student and lecturer
    if (!block1.phrases.length && !block2.phrases.length) {
      grade = 0;
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
export default grader;
