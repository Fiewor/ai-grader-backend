import express from "express";
const router = express.Router();
import {
  uploadMark,
  uploadAnswer,
  uploadText,
} from "../controllers/uploadController";

router.post(`/mark`, uploadMark);
router.post(`/answer`, uploadAnswer);
router.post(`/text`, uploadText);

module.exports = router;
