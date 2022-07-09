const express = require("express");
const router = express.Router();
const {
  uploadMark,
  uploadAnswer,
  uploadText,
} = require("../controllers/uploadController");

router.post(`/mark`, uploadMark);

router.post(`/answer`, uploadAnswer);

router.post(`/text`, uploadText);

module.exports = router;
