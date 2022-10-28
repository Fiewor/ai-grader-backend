const express = require("express");
const router = express.Router();
const {
  getAllDocs,
  deleteDoc,
} = require("../controllers/allUploadsController");

router.get(`/`, getAllDocs);
router.delete("/:doc/:id", deleteDoc);

module.exports = router;
