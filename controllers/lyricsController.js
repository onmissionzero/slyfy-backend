const pool = require('../utils/db');

const { getCurrentTrackPlaying, refreshToken } = require('../utils/spotifyHandler');
const { retrieveAccessTokenQuery } = require('../utils/dbQuery');
const { getLyrics, getLRCLyrics, cleanTrackName } = require('../utils/lyricsHandler');

const lyrics = async (req, res) => {
/*   const origin = req.get('Origin') || req.get('Referer');
  if (origin && origin.startsWith(process.env.FRONTEND_URL)) { */
    const id = req.user;
    try {
      const values = [id];
      const query_result = await pool.query(retrieveAccessTokenQuery, values);
      
      if(query_result.rows[0] === undefined)
      {
        res.status(401).json({error: "Your ID is invalid. Please logout and try logging in again."});
        return;
      }
      let { access_token, created_at, expires_at } = query_result.rows[0];
      const now = new Date();
      if( now > expires_at )
      {
        console.log("Spotify Access Token expired for " + id + " " + now);
        access_token = await refreshToken(id);
        console.log("Spotify Access Token refreshed for " + id + " " + now);
      }

      const jsonResponse = await getCurrentTrackPlaying(access_token);  
      if('error' in jsonResponse)
      {
        res.status(500).json(jsonResponse);
        return;
      }

      const track = jsonResponse.item;
      const trackName = track.name;
      const duration = Math.floor(track.duration_ms/1000);
      const albumName = track.album.name || trackName;
      const artistNames = track.artists.map(artist => artist.name);
      const clean_trackName = cleanTrackName(trackName);
      const clean_albumName = cleanTrackName(albumName);

      const modifiedLyrics = await getLRCLyrics(artistNames[0], clean_trackName, clean_albumName, duration);
      res.json({
        lyrics: modifiedLyrics.syncedLyrics || modifiedLyrics.plainLyrics || 'No Lyrics Found',
        synced: modifiedLyrics.syncedLyrics ? true : false
      });
      
    } catch(error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  /* } else {
    res.status(403).send('Forbidden');
  } */
};
  
const currentlyPlaying = async (req, res) => {
/*   const origin = req.get('Origin') || req.get('Referer');
  if (origin && origin.startsWith(process.env.FRONTEND_URL)) { */
    const id = req.user;
    try {
      const values = [id];
      const query_result = await pool.query(retrieveAccessTokenQuery, values);
      
      if(query_result.rows[0] === undefined)
      {
        res.status(401).json({error: "Your ID is invalid. Please logout and try logging in again."});
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

      const jsonResponse = await getCurrentTrackPlaying(access_token);
      if (jsonResponse.error) {
        if (jsonResponse.error === "No song is being played at the moment") {
          res.status(200).json(jsonResponse);
        } else {
          res.status(500).json(jsonResponse);
        }
        return;
      }

      const isPlaying = jsonResponse.is_playing;
      const track = jsonResponse.item;
      const track_id = track.id;
      const coverArt = track.album.images[0].url;
      const trackName = track.name;
      const progress = Math.floor(jsonResponse.progress_ms/1000);
      const artistNames = track.artists.map(artist => artist.name);
      const trackUrl = track.external_urls.spotify;
      const duration = Math.floor(track.duration_ms/1000);
      
      res.json({
        isPlaying: isPlaying ? true : false,
        track_id: track_id,
        cover_art: coverArt,
        track_name: trackName,
        artists: artistNames,
        spotify_url: trackUrl,
        progress: progress,
        duration: duration
      });
      
    } catch(error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
/*   } else {
    res.status(403).send('Forbidden');
  } */
}
  module.exports = {
    lyrics,
    currentlyPlaying
  };