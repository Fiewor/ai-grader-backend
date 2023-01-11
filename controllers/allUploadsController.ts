const { default: mongoose } = require("mongoose");
const { AnswerSheet, MarkSheet } = require("../models/textModel");

// @desc    Get all documents
// @route   GET /api/viewGrade
// @access  Public
export const getAllDocs = async (req, res) => {
  try {
    // extract all documents from DB
    let answerDoc = await AnswerSheet.find({}, { page: { fileName: 1 } });
    let markDoc = await MarkSheet.find({}, { page: { fileName: 1 } });

    // const doc = await AnswerSheet.find(
    //   { user: req.user.id },
    //   { page: { fileName: 1 } } //projection
    // );
    let dummyDoc = [
      {
        page: {
          rawText: [],
          fileName: "empty document",
          textByNumber: [],
        },
        _id: new mongoose.Types.ObjectId("61d634706a98a61edd42bf45"),
      },
    ];
    // ! Check if answerDoc and markDoc are non-empty in DB
    if (!answerDoc.length) answerDoc = dummyDoc;
    if (!markDoc.length) markDoc = dummyDoc;
    res.send({ answerDoc, markDoc });
  } catch (err) {
    console.log(err);
  }
};

// @desc    Delete specific text
// @route   DELETE /api/viewGrade/:doc/:id
// @access  Public
export const deleteDoc = async (req, res) => {
  const { doc, id } = req.params;
  const deleteStatus =
    doc === "answerSheet"
      ? await AnswerSheet.findByIdAndDelete(id)
      : await MarkSheet.findByIdAndDelete(id);
  if (!deleteStatus) {
    res.status(400);
    throw new Error("Doc not found");
  }
  res.status(200).json({ message: `Deleted doc ${id}` });
};
