const express = require("express");

const router = express.Router();

const { user } = require('../controllers/userController');

const { verifyJWT } = require('../middlewares/verifyJWT');

router.get('/me', verifyJWT, user);


module.exports = router