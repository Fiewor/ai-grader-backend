// logic for compiling text and keyphrases from uploaded page and saving in mongoDB document
export {};
const { keyPhraseExtraction, getTextFromImage } = require("./textAnalytics.ts");

interface TextSegment {
  id: 1;
  text: string;
  phrases: string[];
}

// extract text and keyPhrase and format as object to be saved in mongoDB
export const textAndPhraseCompile = async (path: string) => {
  const { joinedArray, textArray } = await getTextFromImage(path); // returns lines of read text
  let segmentArray: TextSegment[] = [];

  for (const line of joinedArray) {
    console.log("line: ", line);
    let currentPhrase = await keyPhraseExtraction([line]);

    let textSegment: TextSegment = {
      id: joinedArray.indexOf(line),
      text: line,
      phrases: currentPhrase.flat(),
    };

    segmentArray.push(textSegment);
  }
  return { segmentArray, textArray };
};

export const compileAndSave = async (
  fileName: string,
  path: string,
  doc: {
    create: (arg0: {
      user: null;
      page: { fileName: string; rawText: any; textByNumber: TextSegment[] };
    }) => any;
    findOne: () => any;
  }
) => {
  let { segmentArray, textArray: rawText } = await textAndPhraseCompile(path);
  let saveStatus = false;
  console.log("segmentArray", segmentArray);

  if (
    segmentArray === undefined ||
    (segmentArray[0].text === undefined && segmentArray[0].phrases.length === 0)
  ) {
    console.log("Error: There is no data to save");
  } else {
    let user;
    try {
      const data = {
        user:
          // user ? req.user.id : //! TO:DO: check request header for user and put this ternary back in
          null,
        page: { fileName, rawText, textByNumber: segmentArray },
      };

      await doc.create(data);
      const myDoc = await doc.findOne();
      if (myDoc) {
        console.log("Document saved successfully");
        saveStatus = true;
      } else {
        throw new Error("An error occured while attempting to save document");
      }
      // add the type for a failed mongoDB error
    } catch (err) {
      console.log(err);
    }
    return saveStatus;
  }
};
