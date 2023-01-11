import express from "express";
const router = express.Router();
import {
  getAllGuides,
  getGuidesWithId,
} from "../controllers/markingGuideController";

router.get("/", getAllGuides);
router.get("/:id", getGuidesWithId);

export default router;
