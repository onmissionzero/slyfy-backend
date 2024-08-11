const jwt = require('jsonwebtoken');
const { generateJWTRefreshToken, generateJWTAccessToken } = require('../utils/jwt');

const verifyJWT = async (req, res, next) => {
    const accessToken = req.cookies['jwt_access_token'];
    const refreshToken = req.cookies['jwt_refresh_token'];

    if (!accessToken) {
        if (!refreshToken) {
            return res.status(401).json({ error: 'Error authenticating you. Please login again.' });
        }

        // Handle refresh token verification
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decodedRefresh) => {
            if (err) {
                console.log(err);
                return res.status(403).json({ error: 'Invalid refresh token. Please login again.' });
            }

            try {
                const newAccessToken = generateJWTAccessToken({ id: decodedRefresh.id });
                const newRefreshToken = generateJWTRefreshToken({ id: decodedRefresh.id });

                res.cookie('jwt_access_token', JWTAccessToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 60 * 60 * 1000 });
                res.cookie('jwt_refresh_token', JWTRefreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
                res.header('Access-Control-Allow-Credentials', 'true');
                res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);

                req.user = decodedRefresh.id;
                console.log('JWT Token refreshed for ' + req.user);
                next();
            } catch (refreshError) {
                return res.status(403).json({ error: 'Could not refresh token. Please login again.' });
            }
        });
    } else {
        // Handle access token verification
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
            if (error) {
                if (error.name === 'TokenExpiredError') {
                    // Token expired but provided, handle it as a refresh case
                    if (!refreshToken) {
                        return res.status(401).json({ error: 'No refresh token provided.' });
                    }

                    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decodedRefresh) => {
                        if (err) {
                            console.log(err);
                            return res.status(403).json({ error: 'Invalid refresh token. Please login again.' });
                        }

                        try {
                            const newAccessToken = generateJWTAccessToken({ id: decodedRefresh.id });
                            const newRefreshToken = await generateJWTRefreshToken({ id: decodedRefresh.id });

                            res.cookie('jwt_access_token', JWTAccessToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 60 * 60 * 1000 });
                            res.cookie('jwt_refresh_token', JWTRefreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
                            res.header('Access-Control-Allow-Credentials', 'true');
                            res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);

                            req.user = decodedRefresh.id;
                            console.log('JWT Token refreshed for ' + req.user);
                            next();
                        } catch (refreshError) {
                            return res.status(403).json({ error: 'Could not refresh token' });
                        }
                    });
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