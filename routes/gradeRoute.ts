import express from "express";
const router = express.Router();
import getGrades from "../controllers/gradeController";
const { protect } = require("../middleware/authMiddleware");

// router.get("/", protect, getGrades);
router.get(`/`, getGrades);

module.exports = router;
