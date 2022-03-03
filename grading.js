// grading logic goes here
// some code to compare markKeyPhrase and answerKeyPhrase
let grade = 0;
const grader = (array1, array2) => {
  for (let i = 0; i <= array1.length; i++) {
    if (array1[i] === array2[i]) grade += 1;
  }
};

export default grader;
