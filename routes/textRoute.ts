import express from "express";
const router = express.Router();

import { getAllText, getTextWithId } from "../controllers/textController";

router.get("/", getAllText);
router.get("/:id", getTextWithId);

export default router;
