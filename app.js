'use strict';

const express = require('express')
const app = express()
const port = process.env.PORT||3001
const fileUpload = require('express-fileupload');

const async = require('async');
const fs = require('fs');
const https = require('https');
const path = require("path");
const createReadStream = require('fs').createReadStream
const sleep = require('util').promisify(setTimeout);
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;

/**
 * AUTHENTICATE
 * This single client is used for all examples.
 */


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
