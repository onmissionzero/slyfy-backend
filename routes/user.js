const express = require("express");

const router = express.Router();

const { user, logout } = require('../controllers/userController');

const { verifyJWT } = require('../middlewares/verifyJWT');

router.get('/me', verifyJWT, user);

router.post('/logout', logout);


module.exports = router