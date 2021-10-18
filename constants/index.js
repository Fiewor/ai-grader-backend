const express = require('express')
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;

export const app = express()
export const port = process.env.PORT||3001
export const fileUpload = require('express-fileupload');
export const axios = require('axios')
export const async = require('async');
export const fs = require('fs');
// export const https = require('https');
export const path = require("path");
export const createReadStream = fs.createReadStream
export const sleep = require('util').promisify(setTimeout);
export const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
export const key = process.env.API_KEY;
export const endpoint = process.env.API_ENDPOINT;
export const text_key = process.env.TEXT_KEY;
export const text_endpoint = process.env.TEXT_ENDPOINT;
export const textAnalyticsClient = new TextAnalyticsClient(text_endpoint,  new AzureKeyCredential(text_key));
export const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint);

// import {
//     app,
//     port,
//     fileUpload,
//     async,
//     fs,
//     path,
//     createReadStream,
//     sleep,
//     computerVisionClient,
//     textAnalyticsClient,
//     text_endpoint,
//     text_key,
//     endpoint,
//     key,
// } from './constants/index.js'