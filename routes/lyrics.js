const express = require("express");

const { lyrics, currentlyPlaying } = require('../controllers/lyricsController');

const { verifyJWT } = require('../middlewares/verifyJWT');

const router = express.Router();

router.get("/lyrics", verifyJWT, lyrics);
router.get("/currently-playing", verifyJWT, currentlyPlaying);

module.exports = router