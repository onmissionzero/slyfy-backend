const pool = require('../utils/db');

const { getSpotifyUserData, getTopTracks, getTopArtists, refreshToken } = require('../utils/spotifyHandler');
const { retrieveAccessTokenQuery } = require('../utils/dbQuery');

const user = async (req, res) => {
/*     const origin = req.get('Origin') || req.get('Referer');
    if (origin && origin.startsWith(process.env.FRONTEND_URL)) { */
        const id = req.user;
        try {
            const values = [id];
            const query_result = await pool.query(retrieveAccessTokenQuery, values);
            
            if(query_result.rows[0] === undefined) {
                res.status(401).json({error: "Your ID is invalid. Please logout and try logging in again."});
                return;
            }
            let { access_token, created_at, expires_at } = query_result.rows[0];
            const now = new Date();
            if( now > expires_at ) {
                console.log("Spotify Token expired for " + id + " " + now);
                access_token = await refreshToken(id);
                console.log("Spotify Token refreshed for " + id + " " + now);
            }

            const userData = await getSpotifyUserData(access_token);
            const { id: user_id, display_name, images } = userData;
            const pfp_url = images[0]?.url  || 'https://fakeimg.pl/64x64/000000/ffffff?text=+';

            if('error' in userData) {
                res.status(500).json(userData);
                return;
            }
            res.json({
                pfp_url: pfp_url,
                display_name: display_name
            });
        } catch(error) {
            console.error('Error processing request: ', error);
            res.status(500).json({ error: 'Error authenticating user.' });
        }
/*     }  else {
        res.status(403).send('Forbidden');
    } */
};

const topTracks = async (req, res) => {
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

        const jsonResponse = await getTopTracks(access_token);
        if('error' in jsonResponse)
        {
            res.status(500).json(jsonResponse);
            return;
        }

        res.json(jsonResponse);
        
    } catch(error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
/*   } else {
    res.status(403).send('Forbidden');
    } */
}

const topArtists = async (req, res) => {
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

        const jsonResponse = await getTopArtists(access_token);
        if('error' in jsonResponse)
        {
            res.status(500).json(jsonResponse);
            return;
        }

        res.json(jsonResponse);
        
    } catch(error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
/*   } else {
    res.status(403).send('Forbidden');
    } */
}

module.exports = {
    user,
    topTracks,
    topArtists
}