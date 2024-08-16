const jwt = require('jsonwebtoken');
const { generateJWTRefreshToken, generateJWTAccessToken } = require('../utils/jwt');
const { getDomainFromUrl, cookifyRes } = require('../utils/cookie');

const handleRefreshToken = async (req, res, next, refreshToken) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decodedRefresh) => {
        if (err) {
            console.log(err);
            return res.status(403).json({ error: 'Invalid refresh token. Please login again.' });
        }

        try {
            const newAccessToken = generateJWTAccessToken({ id: decodedRefresh.id });
            const newRefreshToken = generateJWTRefreshToken({ id: decodedRefresh.id });
            const domain = getDomainFromUrl(process.env.FRONTEND_URL);
            if (!domain) {
                throw new Error('Invalid domain');
            }

            cookifyRes(res, newAccessToken, newRefreshToken, domain);
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);

            req.user = decodedRefresh.id;
            console.log('JWT Token refreshed for ' + req.user);
            next();
        } catch (refreshError) {
            return res.status(403).json({ error: 'Could not refresh token. Please login again.' });
        }
    });
}

const verifyJWT = async (req, res, next) => {
    const accessToken = req.cookies['jwt_access_token'];
    const refreshToken = req.cookies['jwt_refresh_token'];

    if (!accessToken) {
        if (!refreshToken) {
            return res.status(401).json({ error: 'Error authenticating you. Please login again.' });
        }

        return handleRefreshToken(req, res, next, refreshToken);
    } else {
        // Handle access token verification
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
            if (error) {
                if (error.name === 'TokenExpiredError') {
                    // Token expired but provided, handle it as a refresh case
                    if (!refreshToken) {
                        return res.status(401).json({ error: 'No refresh token provided.' });
                    }

                    return handleRefreshToken(req, res, next, refreshToken);
                } else {
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