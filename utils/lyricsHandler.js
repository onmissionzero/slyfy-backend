const cleanTrackName = (trackName) => {
    return trackName.replace(/\s*\(.*?\)\s*/g, '');
  };

const getLyrics = async (artistNames,trackName) => {

  const lyricsResponse = await fetch(`https://api.lyrics.ovh/v1/${artistNames[0]}/${trackName}`);
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

  module.exports = {
    cleanTrackName,
    getLyrics
  }