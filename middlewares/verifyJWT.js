const jwt = require('jsonwebtoken');
const { generateJWTRefreshToken, generateJWTAccessToken } = require('../utils/jwt');

// Function to handle token refresh
const handleRefreshToken = async (req, res) => {
    const refreshToken = req.headers['x-refresh-token'];
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decodedRefresh) => {
        if (err) {
            console.error('Invalid refresh token:', err);
            return res.status(403).json({ error: 'Invalid refresh token. Please login again.' });
        }

        try {
            const newAccessToken = generateJWTAccessToken({ id: decodedRefresh.id });
            const newRefreshToken = generateJWTRefreshToken({ id: decodedRefresh.id });

            console.log('Frontend JWT Token refreshed for user ID:', decodedRefresh.id);
            res.json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        } catch (refreshError) {
            console.error('Could not refresh token:', refreshError);
            return res.status(403).json({ error: 'Could not refresh token. Please login again.' });
        }
    });
};

// Middleware to verify JWT tokens
const verifyJWT = async (req, res, next) => {
    const accessToken = req.headers['authorization']?.split(' ')[1];
    const refreshToken = req.headers['x-refresh-token'];
    if (!accessToken) {
        if (!refreshToken) {
            return res.status(401).json({ error: 'Error authenticating you. Please login again.' });
        }
        // If no access token, try to refresh using the refresh token
        return handleRefreshToken(req, res);
    } else {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
            if (error) {
                if (error.name === 'TokenExpiredError') {
                    if (!refreshToken) {
                        return res.status(401).json({ error: 'No refresh token provided.' });
                    }
                    // If access token expired, try to refresh using the refresh token
                    return handleRefreshToken(req, res);
                } else {
                    console.error('Invalid access token:', error);
                    return res.status(403).json({ error: 'Invalid token' });
                }
            } else {
                req.user = decoded.id;
                next();
            }
        });
    }
};

module.exports = {
    verifyJWT
};
