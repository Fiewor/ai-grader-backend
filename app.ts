"use strict";

require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const { errorHandler } = require("./middleware/errorMiddleware");
import connectDB from "./config/db";

const port = process.env.PORT || 3001;

import gradeRoute from "./routes/gradeRoute";
import textRoute from "./routes/textRoute";
import uploadRoute from "./routes/uploadRoute";
import userRoute from "./routes/userRoute";
import markRoute from "./routes/markRoute";
import allUploadsRoute from "./routes/allUploadsRoute";

connectDB();

app.use(fileUpload());
app.use(cors());
// app.use(errorHandler);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", ["*"]);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/texts", textRoute);
app.use("/api/viewGrade", gradeRoute);
app.use("/api/uploads", uploadRoute);
app.use("/api/users", userRoute);
app.use("/api/mark", markRoute);
app.use("/api/all-uploads", allUploadsRoute);

app.listen(port, () => {
  console.log(`Server is started on port ${port}`);
});
