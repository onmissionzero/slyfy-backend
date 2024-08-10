const querystring = require('node:querystring');
const pool = require('../utils/db');
const { insertAccessTokenQuery, retrieveRefreshTokenQuery } = require('../utils/dbQuery');

async function getAccessToken(code) {
  const url = 'https://accounts.spotify.com/api/token';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')
    },
    body: querystring.stringify({
      code: code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  };
  try {
    const tokenResponse = await fetch(url, options);
    if (!tokenResponse.ok) {
      throw new Error('Failed to fetch access token');
    }
    return await tokenResponse.json();
  } catch(error) {
    return {error: error};
  }
};

const refreshToken = async (user_id) => {
  try {
    const queryValues = [user_id];
    const rf_query_result = await pool.query(retrieveRefreshTokenQuery, queryValues);
    const old_refresh_token = rf_query_result.rows[0].refresh_token;

    const jsonData = await exchangeRefreshTokenForAccessToken(old_refresh_token);

    const { access_token, token_type, scope, expires_in, new_refresh_token } = jsonData;
    const scopes = `{"${scope.split(' ').join('","')}"}`;
    const created_at = new Date();
    const expires_at = new Date(created_at.getTime() + (expires_in * 1000));
    
    const refresh_token = new_refresh_token ? new_refresh_token : old_refresh_token;
    const values = [user_id, access_token, token_type, scopes, refresh_token, created_at, expires_at];

    const result = await pool.query(insertAccessTokenQuery, values);
    return access_token;
  } catch(error) {
    return {error: 'Cannot refresh token'};
  }
}

async function exchangeRefreshTokenForAccessToken(old_refresh_token) {
  const url = 'https://accounts.spotify.com/api/token';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')
    },
    body: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: old_refresh_token
    })
  };
  try {
    const tokenResponse = await fetch(url, options);
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange refresh token for access token');
    }
    return await tokenResponse.json();
  } catch(error) {
    console.log(error);
    return {error: error};
  }
};

async function getSpotifyUserData(access_token) {
  try {
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      }
    });
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }
    return await userResponse.json();
  } catch(error) {
    console.error(error);
    return {error: error};
  }
};

async function getCurrentTrackPlaying(user_id, access_token) {
  try {
    let trackResponse = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      }
    });
    if(trackResponse.status===204)
    {
      return {error: "No song is being played at the moment"};
    }
    return await trackResponse.json();

  } catch (error) {
    return {error: "Error fetching the current playing track"};
  }
}

module.exports = {
  getAccessToken,
  refreshToken,
  exchangeRefreshTokenForAccessToken,
  getSpotifyUserData,
  getCurrentTrackPlaying
}
