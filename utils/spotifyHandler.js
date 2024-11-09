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

async function getCurrentTrackPlaying(access_token) {
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

async function getTopTracks(access_token) {
  const timeRanges = ['long_term', 'medium_term', 'short_term'];
  
  const fetchTracks = async (time_range) => {
    try {
      let response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=10&offset=0`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + access_token
        }
      });
      if (response.status !== 200) {
        throw new Error(`Error fetching ${time_range} tracks: ${response.statusText}`);
      }
      const data = await response.json();
      return data.items.map(item => ({
        name: item.name,
        artists: item.artists.map(artist => artist.name),
        image: item.album.images[0]?.url
      }));
    } catch (error) {
      return { error: error.message };
    }
  };

  try {
    const results = await Promise.all(timeRanges.map(range => fetchTracks(range)));
    
    return {
      long_term: results[0],
      medium_term: results[1],
      short_term: results[2]
    };
  } catch (error) {
    return { error: "Error fetching top tracks" };
  }
}

async function getTopArtists(access_token) {
  const timeRanges = ['long_term', 'medium_term', 'short_term'];
  
  const fetchArtists = async (time_range) => {
    try {
      let response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=10&offset=0`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + access_token
        }
      });
      if (response.status !== 200) {
        throw new Error(`Error fetching ${time_range} artists: ${response.statusText}`);
      }
      const data = await response.json();
      return data.items.map(item => ({
        name: item.name,
        genres: item.genres,
        image: item.images[0]?.url
      }));
    } catch (error) {
      return { error: error.message };
    }
  };

  try {
    const results = await Promise.all(timeRanges.map(range => fetchArtists(range)));
    
    return {
      long_term: results[0],
      medium_term: results[1],
      short_term: results[2]
    };
  } catch (error) {
    return { error: "Error fetching top artists" };
  }
}


module.exports = {
  getAccessToken,
  refreshToken,
  exchangeRefreshTokenForAccessToken,
  getSpotifyUserData,
  getCurrentTrackPlaying,
  getTopTracks,
  getTopArtists
}
