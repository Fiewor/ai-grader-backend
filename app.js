"use strict";

const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");

const port = process.env.PORT || 3001;
require("dotenv").config();

const gradeRoute = require(`./routes/gradeRoute`);
const textRoute = require(`./routes/textRoute`);
const uploadRoute = require(`./routes/uploadRoute`);
const userRoute = require(`./routes/userRoute`);

connectDB();

app.use(fileUpload());
app.use(cors());
// app.use(errorHandler);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", ["*"]);
  next();
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

app.use("/api/texts", textRoute);
app.use("/api/viewGrade", gradeRoute);
app.use("/api/uploads", uploadRoute);
app.use("/api/users", userRoute);

app.listen(port, () => {
  console.log(`Server is started on port ${port}`);
});
