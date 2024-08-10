const querystring = require('node:querystring');

const pool = require('../utils/db');
const { getAccessToken, getSpotifyUserData } = require('../utils/spotifyHandler');
const { insertAccessTokenQuery } = require('../utils/dbQuery');
const { generateJWTAccessToken, generateJWTRefreshToken } = require('../utils/jwt');

const authorize = (req, res) => {

  const origin = req.get('Origin') || req.get('Referer');
  if (origin && origin.startsWith(process.env.FRONTEND_URL)) {
    const state = 'authorize';
    const scope = 'user-read-playback-state user-read-email';

    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECT_URI,
        state: state
      }));
  } else {
    res.status(403).send('Forbidden');
  }
};

const callback = async (req, res) => {
  try {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const error = req.query.error || null;

    //Handle State ( attacks )

    if (error != null || code==null ) {
      console.log("ERROR: " + error);
      res.status(401).redirect(`${process.env.FRONTEND_URL}/callback?error=Authorization Error. Please Try Again`);
      return;
    }

    //check if user_id exists in db and refresh accordingly

    const jsonData = await getAccessToken(code); //Exchange auth code for access token
    const { access_token, token_type, scope, expires_in, refresh_token } = jsonData;

    //handle error
    
    const userData = await getSpotifyUserData(access_token);
    const { id: user_id, display_name, images } = userData;
    const pfp_url = images[0]?.url  || 'https://fakeimg.pl/64x64/000000/ffffff?text=+';

    //handle error

    const scopes = `{"${scope.split(' ').join('","')}"}`;
    const created_at = new Date();
    const expires_at = new Date(created_at.getTime() + (expires_in * 1000));

    const values = [user_id, access_token, token_type, scopes, refresh_token, created_at, expires_at];

    const result = await pool.query(insertAccessTokenQuery, values);

    const JWTAccessToken = generateJWTAccessToken({id: user_id});
    const JWTRefreshToken = generateJWTRefreshToken({id: user_id});
    res.cookie('jwt_access_token', JWTAccessToken, { httpOnly: true, sameSite: 'lax', secure: true, maxAge: 60 * 60 * 1000 });
    res.cookie('jwt_refresh_token', JWTRefreshToken, { httpOnly: true, sameSite: 'lax', secure: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
    res.header('Access-Control-Allow-Credentials', 'true');
    res.redirect(`${process.env.FRONTEND_URL}/callback?pfp_url=${pfp_url}&display_name=${display_name}`);
  } catch (err) {
    console.error(err);
    res.status(401).redirect(`${process.env.FRONTEND_URL}/callback?error=Authorization Error. Please Try Again`);
  }
}

module.exports = {
    authorize,
    callback
};