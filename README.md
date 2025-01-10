<p align="center">
    <img alt="Slyfy" src="https://github.com/onmissionzero/slyfy-frontend/blob/main/public/LogoTransparent.png?raw=true" width="100">
</p>

<h1 align="center">Real-time Lyrics for Spotify</h1>

## Slyfy

This is the backend for [Slyfy](https://slyfy-vercel.app).

The fronend for this project can be found [here](https://github.com/onmissionzero/slyfy-frontend).

![Preivew of the website with the Picture-in-Picture mode](https://github.com/onmissionzero/slyfy-frontend/blob/main/public/WebsitePreview.png?raw=true)

Enjoy synchronized lyrics displayed in real-time as you listen to your favorite tracks. Activate Picture-in-Picture mode for a seamless and convenient lyrics display while you enjoy your music.

## Setup

Refer documentation here.\
[https://developer.spotify.com/documentation/web-api/concepts/apps](https://developer.spotify.com/documentation/web-api/concepts/apps)

Create an app in Spotify (Register as developer first duh).\
[https://developer.spotify.com/dashboard/create](https://developer.spotify.com/dashboard/create)


tl;dr: The redirect URI specified in the app settings must be your server URL that handles the authentication response from Spotify (in this case, /callback).\
Cited from the docs:
```
"In Redirect URIs enter one or more addresses that you want to allowlist with Spotify. This URI enables the Spotify authentication service to automatically invoke your app every time the user logs in (e.g. http://localhost:8080)"
```

Build the project: (Replace the env variables with yours)
```
npm install
cp example.env .env
```

Run the app:
```
npm run dev
```
## Disclaimer

This project is unofficial and is not associated with Spotify in any way.
