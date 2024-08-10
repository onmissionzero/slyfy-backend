const pool = require('../utils/db');

const { getCurrentTrackPlaying, refreshToken } = require('../utils/spotifyHandler');
const { retrieveAccessTokenQuery } = require('../utils/dbQuery');
const { getLyrics } = require('../utils/lyricsHandler');

const lyrics = async (req, res) => {
  
  const id = req.user;
  try {
    const values = [id];
    const query_result = await pool.query(retrieveAccessTokenQuery, values);
    
    if(query_result.rows[0] === undefined)
    {
      res.json({error: "Your ID is invalid. Please logout and try logging in again."});
      return;
    }
    let { access_token, created_at, expires_at } = query_result.rows[0];
    const now = new Date();
    if( now > expires_at )
    {
      console.log("Token expired for " + id + " " + now);
      access_token = await refreshToken(id);
      console.log("Token refreshed for " + id + " " + now);
    }

    const jsonResponse = await getCurrentTrackPlaying(id, access_token);
    if('error' in jsonResponse)
    {
      res.json(jsonResponse);
      return;
    }

    const track = jsonResponse.item;
    const coverArt = track.album.images[0].url;
    const trackName = track.name;
    const artistNames = track.artists.map(artist => artist.name);
    const trackUrl = track.external_urls.spotify;
    
    const modifiedLyrics = await getLyrics(artistNames, trackName);
    
    res.json({
      cover_art: coverArt,
      track_name: trackName,
      artists: artistNames,
      spotify_url: trackUrl,
      lyrics: modifiedLyrics
    });
    
  } catch(error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
  
  module.exports = {
    lyrics
  };