const express = require("express");

const router = express.Router();

const { authorize, callback } = require('../controllers/oauthController');


//Initial Authorization, done once
router.get("/authorize", authorize);

// redirect from /login
router.get('/callback', callback);

module.exports = router