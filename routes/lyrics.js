const express = require("express");

const { lyrics } = require('../controllers/lyricsController');

const { verifyJWT } = require('../middlewares/verifyJWT');

const router = express.Router();

router.get("/lyrics", verifyJWT, lyrics);

module.exports = router