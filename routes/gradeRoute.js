const express = require("express");
const router = express.Router();
const { getGrades } = require("../controllers/gradeController");
const { protect } = require("../middleware/authMiddleware");

// router.get("/", protect, getGrades);
router.get("/", getGrades);

module.exports = router;
