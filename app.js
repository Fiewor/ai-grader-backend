'use strict';

const express = require('express')
const app = express()
const port = process.env.PORT||3001
const fileUpload = require('express-fileupload');

require('dotenv').config()

const async = require('async');
const fs = require('fs');
const https = require('https');
const path = require("path");
const createReadStream = require('fs').createReadStream
const sleep = require('util').promisify(setTimeout);
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;

const key = process.env.API_KEY;
const endpoint = process.env.API_ENDPOINT;

const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint);

function computerVision() {
    async.series([
        async function () {    
            const STATUS_SUCCEEDED = "succeeded";
            const STATUS_FAILED = "failed"
            console.log('-------------------------------------------------');
            console.log('READ');
            console.log();
        
            const handwrittenImagePath = __dirname + '\\note.jpeg';
            //try {
            //    await downloadFilesToLocal(handwrittenTextURL, handwrittenImagePath);
            //} catch {
            //    console.log('>>> Download sample file failed. Sample cannot continue');
            //    process.exit(1);
            //}
    
            // With a local image, get the text.
            console.log('\Reading local image for text in ...', path.basename(handwrittenImagePath));

            // Call API, returns a Promise<Models.readInStreamResponse>
            const streamResponse = await computerVisionClient.readInStream(() => createReadStream(handwrittenImagePath))
                .then((response) => {
                return response;
            });

            console.log();
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

                // Looping through: pages of result from readResults[], then Line[]
                for (const textRecResult of readOpResult.analyzeResult.readResults) {
                    for (const line of textRecResult.lines) {
                    console.log(line.text)
                    }
                }
                break;
                }
                await sleep(1000);
            }
            console.log();
  
        },
        function () {
          return new Promise((resolve) => {
            resolve();
          })
        }
      ], (err) => {
        throw (err);
      });
}

computerVision();

app.use(fileUpload());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/', (req, res)=>{
    res.send(`Working`);
})

app.post('/login', (req, res)=>{
    res.send(`login working!`);
})

app.post('/upload',(req, res)=>{
    for(let file of Object.values(req.files)) {
        let pathToFile = __dirname + "/uploads/" + file.name;

        file.mv(pathToFile, (err) => {
            if (err) {
                console.log('and error is ', err);
            }
        });
    }

    res.send(`upload working!, check uploads folder in the project`);
})

app.listen(port, () => {
    console.log(`Server is started on port ${port}`);
})
