const jwt = require('jsonwebtoken');
const { generateJWTRefreshToken, generateJWTAccessToken } = require('../utils/jwt');

const verifyJWT = async (req, res, next) => {
    const token = req.cookies['jwt_access_token'];
    if (!token) {
        return res.status(401).json({ error: 'Error with authentication. Please login again.' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (error, decoded) => {
        if (error) {
            if (error.name === 'TokenExpiredError') {
                try {
                    const refreshToken = req.cookies['jwt_refresh_token'];
                    if (!refreshToken) {
                        return res.status(401).json({ error: 'No refresh token provided' });
                    }

                    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decodedRefresh) => {
                        if (err) {
                            console.log(err);
                            return res.status(403).json({ error: 'Invalid refresh token' });
                        }

                        const newAccessToken = generateJWTAccessToken({id: decodedRefresh.id});

                        const newRefreshToken = await generateJWTRefreshToken({id: decodedRefresh.id});

                        res.cookie('jwt_access_token', newAccessToken, { httpOnly: true, sameSite: 'lax', secure: false });
                        res.cookie('jwt_refresh_token', newRefreshToken, { httpOnly: true, sameSite: 'lax', secure: false});
                        req.user = decodedRefresh.id;
                        console.log('JWT Token refreshed for ' + req.user);
                        next();
                    });
                } catch (refreshError) {
                    return res.status(403).json({ error: 'Could not refresh token' });
                }
            } else {
                return res.status(403).json({ error: 'Invalid token' });
            }
        } else {
            req.user = decoded.id;
            next();
        }
    });
};

module.exports = {
    verifyJWT
};
