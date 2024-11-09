const querystring = require('node:querystring');

const pool = require('../utils/db');
const { getAccessToken, getSpotifyUserData } = require('../utils/spotifyHandler');
const { insertAccessTokenQuery } = require('../utils/dbQuery');
const { generateJWTAccessToken, generateJWTRefreshToken } = require('../utils/jwt');

const authorize = (req, res) => {
/*   const origin = req.get('Origin') || req.get('Referer');
  if (origin && origin.startsWith(process.env.FRONTEND_URL)) { */
    const state = req.query.isMobile === 'true' ? 'authorize_mobile' : 'authorize'; // Ensure isMobile is a string
    const scope = 'user-read-playback-state user-read-email user-top-read';

    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECT_URI,
        state: state
      }));
/*   } else {
    res.status(403).send('Forbidden');
  } */
};

const callback = async (req, res) => {
  try {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const error = req.query.error || null;

    if (error != null || code == null) {
      console.log("ERROR: " + error);
      return res.redirect(`${process.env.FRONTEND_URL}/error`);
    }

    const jsonData = await getAccessToken(code); //Exchange auth code for access token
    const { access_token, token_type, scope, expires_in, refresh_token } = jsonData;

    // Get user data
    const userData = await getSpotifyUserData(access_token);
    const { id: user_id, display_name, images } = userData;
    const pfp_url = images[0]?.url  || 'https://fakeimg.pl/64x64/000000/ffffff?text=+';
    const scopes = `{"${scope.split(' ').join('","')}"}`;
    const created_at = new Date();
    const expires_at = new Date(created_at.getTime() + (expires_in * 1000));
    const values = [user_id, access_token, token_type, scopes, refresh_token, created_at, expires_at];
    const result = await pool.query(insertAccessTokenQuery, values); //store in db
    
    const JWTAccessToken = generateJWTAccessToken({id: user_id});
    const JWTRefreshToken = generateJWTRefreshToken({id: user_id});

    if (state === 'authorize_mobile') {
      // Redirect to a custom URL scheme for the mobile app
      const redirectUrl = `slyfy://callback?access_token=${JWTAccessToken}&refresh_token=${JWTRefreshToken}&user_id=${user_id}`;
      res.redirect(redirectUrl);
    } else {
      // For web clients
      const redirectUrl = `${process.env.FRONTEND_URL}/callback?access_token=${JWTAccessToken}&refresh_token=${JWTRefreshToken}&user_id=${user_id}`;
      res.redirect(redirectUrl);
    }
  } catch (err) {
    console.error(err);
    if (state === 'authorize_mobile') {
      // Redirect to a custom URL scheme for the mobile app
      const redirectUrl = `slyfy://callback?error=${err}`;
      res.redirect(redirectUrl);
    } else {
      // For web clients
      const redirectUrl = `${process.env.FRONTEND_URL}/error`;
      res.redirect(redirectUrl);
    }
  }
};

module.exports = {
    authorize,
    callback
};
