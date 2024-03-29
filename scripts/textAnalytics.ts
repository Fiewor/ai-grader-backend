const ComputerVisionClient =
  require("@azure/cognitiveservices-computervision").ComputerVisionClient;
import {
  TextAnalyticsClient,
  AzureKeyCredential,
} from "@azure/ai-text-analytics";
const key = process.env.API_KEY || "";
const endpoint = process.env.API_ENDPOINT || "";
const text_key = process.env.TEXT_KEY || "";
const text_endpoint = process.env.TEXT_ENDPOINT || "";
const textAnalyticsClient = new TextAnalyticsClient(
  text_endpoint,
  new AzureKeyCredential(text_key)
);
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;
const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);
import fs from "fs";
const fsPromises = fs.promises;
const sleep = require("util").promisify(setTimeout);
import joinSame from "./joinSame";

// function to extract identifiable text from image. takes image path as argument
export const getTextFromImage = async (
  imagePath: string
): Promise<{
  textArray: string[];
  joinedArray: string[];
}> => {
  const STATUS_SUCCEEDED = "succeeded";
  const STATUS_FAILED = "failed";
  let textArray: string[] = [],
    completeText: string;
  console.log(`Reading image for text in ...${imagePath}`);

  const streamResponse = await computerVisionClient
    .read(imagePath)
    .then((response: string) => response)
    .catch((err: string) => console.error(err));

  // Get operation location from response, so you can get the operation ID.
  const operationLocation = streamResponse.operationLocation;
  // Get the operation ID at the end of the URL
  const operationId = operationLocation.substring(
    operationLocation.lastIndexOf("/") + 1
  );
  // Wait for the read operation to finish, use the operationId to get the result.
  while (true) {
    const readOpResult = await computerVisionClient
      .getReadResult(operationId)
      .then((result) => result);
    console.log(`Read status: ${readOpResult.status}`);

    if (readOpResult.status === STATUS_FAILED) {
      console.log("The Read File operation has failed.");
      break;
    }
    if (readOpResult.status === STATUS_SUCCEEDED) {
      console.log("The Read File operation was a success.");
      console.log();
      console.log("Read File local image result:");
      // Print the text captured
      for (const textRecResult of readOpResult.analyzeResult.readResults) {
        if (textRecResult.lines.length) {
          for (const line of textRecResult.lines) {
            textArray.push(line.text);
          }
          completeText = textArray.join(" ");
          console.log("completeText: ", completeText);
        } else {
          console.log("No recognized text.");
        }
      }
      break;
    }
    await sleep(1000);
  }
  let joinedArray: string[] = joinSame(textArray);

  return { textArray, joinedArray };
};

// function to extract key phrases from provided text string
export const keyPhraseExtraction = async (
  keyPhrasesInput: string[]
): Promise<string[]> => {
  let extracted: string[] = [];

  try {
    const keyPhraseResult = await textAnalyticsClient.extractKeyPhrases(
      keyPhrasesInput
    );

    if (keyPhraseResult.length === 0) {
      console.log("Unable to extract key phrases");
      throw new Error("Unable to extract key phrases");
    } else {
      console.log("keyPhraseResult: ", keyPhraseResult);
      for (const document of keyPhraseResult) {
        // ! only push documents with identified keyphrases
        // ! this behaviour may be changed later
        if (document["keyPhrases"].length !== 0) {
          console.log(`ID: ${document.id}`);
          console.log(`\tDocument Key Phrases: ${document["keyPhrases"]}`);
          extracted.push(document["keyPhrases"]);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
  return extracted;
};
