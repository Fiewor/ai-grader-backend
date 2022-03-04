const mongoose = require("mongoose");

const textSchema = new mongoose.Schema({
  readText: String,
  //   readText: {
  //       type: String,
  //       required: true,
  //       uppercase: true,
  // immutable: true
  //     },
  //   keyPhrases: [String],
  //   id: mongoose.SchemaTypes.ObjectId
});

module.exports = mongoose.model("Text", textSchema);
