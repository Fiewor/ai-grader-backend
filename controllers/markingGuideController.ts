const { MarkSheet } = require("../models/textModel");

// @desc    Get all text
// @route   GET /api/texts
// @access  Public
const getAllGuides = async (req, res) => {
  try {
    // extract all documents from DB
    const doc = await MarkSheet.find({}, { page: { fileName: 1 } });

    !doc ? res.send(["Empty"]) : res.send(doc);
  } catch (err) {
    console.log(err);
  }
};

// @desc    Get text with Id
// @route   GET /api/texts/:id
// @access  Public
const getGuidesWithId = async (req, res) => {
  let { id } = req.params;
  try {
    const doc = await MarkSheet.findById(id);

    res.send(doc);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getAllGuides, getGuidesWithId };
