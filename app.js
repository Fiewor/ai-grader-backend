'use strict';

const express = require('express')
const app = express()
const port = process.env.PORT||3001
const fileUpload = require('express-fileupload');

require('dotenv').config()

const fs = require('fs');
const path = require("path");
const createReadStream = fs.createReadStream
const sleep = require('util').promisify(setTimeout);
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;

const key = process.env.API_KEY;
const endpoint = process.env.API_ENDPOINT;

const text_key = process.env.TEXT_KEY;
const text_endpoint = process.env.TEXT_ENDPOINT;

const textAnalyticsClient = new TextAnalyticsClient(text_endpoint,  new AzureKeyCredential(text_key));

const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint);

let textArray = [];

app.use(fileUpload());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/', (req, res)=>{
    res.send(`Working`);
})

app.post('/upload/answer/',(req, res)=>{
    for(let file of Object.values(req.files)) {
        let pathToFile = __dirname + "/uploads/answer/" + file.name;

        file.mv(pathToFile, (err) => {
            if (err) {
                console.log('and error is ', err);
            }
        });
    }
    res.send(`Answer sheet(s) uploaded successfully! Check answer folder in the project's uploads directory`);
})

app.post('/upload/mark/', (req, res)=>{
    for(let file of Object.values(req.files)) {
        let pathToFile = __dirname + "/uploads/mark/" + file.name;

        file.mv(pathToFile, (err) => {
            if (err) {
                console.log('and error is ', err);
            }
        });
    }
    res.send(`Marking guide uploaded successfully! Check mark folder in the project's uploads directory`);
})

app.listen(port, () => {
    console.log(`Server is started on port ${port}`);
})

// function to extract identifiable text from image. takes image path as argument
let getTextFromImage = async (imagePath) => {    
    const STATUS_SUCCEEDED = "succeeded";
    const STATUS_FAILED = "failed"
    
    console.log('\Reading local image for text in ...', path.basename(imagePath));
    
    const streamResponse = await computerVisionClient.readInStream(() => createReadStream(imagePath))
        .then((response) => {
            return response;
        })
        .catch(err => console.error(err))

    // Get operation location from response, so you can get the operation ID.
    const operationLocationLocal = streamResponse.operationLocation
    // Get the operation ID at the end of the URL
    const operationIdLocal = operationLocationLocal.substring(operationLocationLocal.lastIndexOf('/') + 1);
        
    // Wait for the read operation to finish, use the operationId to get the result.
    while (true) {
        const readOpResult = await computerVisionClient.getReadResult(operationIdLocal)
            .then((result) => {
                return result;
            })
        console.log('Read status: ' + readOpResult.status)

        if (readOpResult.status === STATUS_FAILED) {
            console.log('The Read File operation has failed.')
            break;
        }
        if (readOpResult.status === STATUS_SUCCEEDED) {
            console.log('The Read File operation was a success.');
            console.log();
            console.log('Read File local image result:');
            // Print the text captured
            for (const textRecResult of readOpResult.analyzeResult.readResults) {
                for (const line of textRecResult.lines) {
                    textArray.push(line.text)
                }
                let completeText = textArray.join(' ')
                console.log(completeText)
            }
            break;
        }
        await sleep(1000);
    }
    return textArray
}

// function to extract key phrases from provided text string
let keyPhraseExtraction = async (client, completeText) => {

    const keyPhrasesInput = [completeText];
    const keyPhraseResult = await client.extractKeyPhrases(keyPhrasesInput);
    
    keyPhraseResult.forEach(document => {
        console.log(`ID: ${document.id}`);
        console.log(`\tDocument Key Phrases: ${document.keyPhrases}`);
    });
}

// read file and extract text from marking guide
fs.readdir(__dirname + "/uploads/mark", (err, files) => {
    if (err) console.log(err)
    
    files.forEach((file) => {
        getTextFromImage(__dirname + `/uploads/mark//${file}`)
        .then((results) => {
            let completeText = results.join(' ')
            keyPhraseExtraction(textAnalyticsClient, completeText);
        })
        .catch((err) => console.log(err))
    });
});

// read file and extract text from answer sheet
fs.readdir(__dirname + "/uploads/answer", (err, files) => {
    if (err) console.log(err)
    
    files.forEach((file) => {
        getTextFromImage(__dirname + `/uploads/answer//${file}`)
        .then((results) => {
            let completeText = results.join(' ')
            keyPhraseExtraction(textAnalyticsClient, completeText);
        })
        .catch((err) => console.log(err))
    });
});
