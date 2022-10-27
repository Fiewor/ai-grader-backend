const express = require("express");
const router = express.Router();
const {
  getAllGuides,
  getGuidesWithId,
} = require("../controllers/markingGuideController");

router.get("/", getAllGuides);
router.get(`/:id`, getGuidesWithId);

module.exports = router;
