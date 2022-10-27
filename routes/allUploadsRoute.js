const express = require("express");
const router = express.Router();
const { getAllDocs } = require("../controllers/allUploadsController");

router.get(`/`, getAllDocs);

module.exports = router;
