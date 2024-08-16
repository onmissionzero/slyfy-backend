const jwt = require('jsonwebtoken');

const generateJWTAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}

const generateJWTRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' });
}



module.exports = {
    generateJWTAccessToken,
    generateJWTRefreshToken
}