const express = require("express");

const router = express.Router();

const { user, topArtists, topTracks } = require('../controllers/userController');

const { verifyJWT } = require('../middlewares/verifyJWT');

router.get('/me', verifyJWT, user);
router.get('/top/tracks',verifyJWT, topTracks);
router.get('/top/artists',verifyJWT, topArtists);


module.exports = router