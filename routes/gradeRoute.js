const express = require("express");
const router = express.Router();
const { getGrades } = require("../controllers/gradeController");

router.get("/", getGrades);

module.exports = router;
