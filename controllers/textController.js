const { AnswerSheet } = require("../models/textModel");

// @desc    Get all text
// @route   GET /api/texts
// @access  Public
const getAllText = async (req, res) => {
  try {
    // extract all documents from DB
    const doc = await AnswerSheet.find({}, { page: { fileName: 1 } });
    // const doc = await AnswerSheet.find(
    //   { user: req.user.id },
    //   { page: { fileName: 1 } } //projection
    // );

    !doc ? res.send(["Empty"]) : res.send(doc);
  } catch (err) {
    console.log(err.stack);
  }
};

// @desc    Get text with Id
// @route   GET /api/texts/:id
// @access  Public
const getTextWithId = async (req, res) => {
  let { id } = req.params;
  try {
    // extract specific documents from DB
    const doc = await AnswerSheet.findById(id);

    !doc
      ? res.send({
          page: {
            _id: "nu113mpty",
            fileName: "empty",
            rawText: ["No text in collection"],
            textByNumber: ["No", "text", "in", "collection"],
          },
        })
      : res.send(doc);
  } catch (err) {
    console.log(err.stack);
  }
};

module.exports = { getAllText, getTextWithId };
