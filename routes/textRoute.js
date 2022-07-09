const express = require("express");
const router = express.Router();

const { getAllText, getTextWithId } = require("../controllers/textController");

router.get(`/`, getAllText);

router.get(`/:id`, getTextWithId);

module.exports = router;
