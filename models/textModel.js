const mongoose = require("mongoose");

const pageSchema = mongoose.Schema(
  {
    page: {
      fileName: String,
      rawText: [String],
      textByNumber: [
        {
          id: Number,
          text: String,
          phrases: [String],
        },
      ],
    },
  },
  {
    // auto creates "updated at" and "created at" fields
    timestamps: true,
  }
);

const AnswerSheet = mongoose.model("AnswerSheet", pageSchema, "answerSheet");
const MarkSheet = mongoose.model("MarkSheet", pageSchema, "markSheet");
const Text = mongoose.model("Text", pageSchema, "text");

module.exports = { AnswerSheet, MarkSheet, Text };
