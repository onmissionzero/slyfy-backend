const cleanTrackName = (trackName) => {
  return trackName.replace(/\s*[\[\(].*?[\]\)]\s*/g, '');
};

const getLyrics = async (artistNames,trackName) => {

  const lyricsResponse = await fetch(`https://api.lyrics.ovh/v1/${artistNames}/${trackName}`);
  const lyricsData = await lyricsResponse.json();

  let lyricsText = '';

  if (lyricsResponse.ok && lyricsData.lyrics) {
    lyricsText = lyricsData.lyrics;
  } else {
    lyricsText = 'No lyrics found :(';
  }

  const lyricsLines = lyricsText.split('\n');

  if (lyricsLines.length > 0 && lyricsLines[0].startsWith('Paroles de la chanson')) {
    lyricsLines.shift();
  }

  const modifiedLyrics = lyricsLines.join('\n');
  
  return modifiedLyrics;
}

/*
Made possible with the help of
LRCLIB - tranxuanthang
https://github.com/tranxuanthang/lrclib
*/
const getLRCLyrics = async (artistNames, trackName, albumName, duration) => {
  const baseUrl = 'https://lrclib.net/api/get';
  const queryParams = new URLSearchParams({
    artist_name: artistNames,
    track_name: trackName,
    album_name: albumName,
    duration: duration
  });

  const headers = {
    'User-Agent': 'Slyfy v1.0.0 https://github.com/onmissionzero/slyfy-frontend'
  };

  try {
    const response = await fetch(`${baseUrl}?${queryParams.toString()}`, { headers });
    if (!response.ok) {
      return "No lyrics found";
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}


  module.exports = {
    cleanTrackName,
    getLyrics,
    getLRCLyrics
  }