// logic for compiling text and keyphrases from uploaded page and saving in mongoDB document

const { keyPhraseExtraction, getTextFromImage } = require("./textAnalytics");

// extract text and keyPhrase and format as object to be saved in mongoDB
const textAndPhraseCompile = async (path) => {
  const { joinedArray, textArray } = await getTextFromImage(path); // returns lines of read text
  let segmentArray = [];

  for (const line of joinedArray) {
    let currentPhrase = await keyPhraseExtraction([line]);

    let textSegment = {
      id: joinedArray.indexOf(line),
      text: line,
      phrases: currentPhrase.flat(),
    };

    segmentArray.push(textSegment);
  }
  return { segmentArray, textArray };
};

const compileAndSave = async (fileName, path, doc) => {
  let { segmentArray, textArray: rawText } = await textAndPhraseCompile(path);
  let saveStatus = false;
  console.log("segmentArray", segmentArray);

  if (
    segmentArray === undefined ||
    (segmentArray[0].text === undefined && segmentArray[0].phrases.length === 0)
  ) {
    console.log("Error: There is no data to save");
  } else {
    try {
      data = {
        user: req.user.id,
        page: { fileName, rawText, textByNumber: segmentArray },
      };

      await col.create(data);
      const myDoc = await col.findOne();
      if (myDoc) {
        console.log("Document saved successfully");
        saveStatus = true;
      } else {
        throw new Error("An error occured while attempting to save document");
      }
    } catch (err) {
      console.log(err.stack);
    }
    return saveStatus;
  }
};

module.exports = { compileAndSave, textAndPhraseCompile };
