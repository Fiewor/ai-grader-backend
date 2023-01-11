import express from "express";
const router = express.Router();
import { getAllDocs, deleteDoc } from "../controllers/allUploadsController";

router.get("/", getAllDocs);
router.delete("/:doc/:id", deleteDoc);

export default router;
