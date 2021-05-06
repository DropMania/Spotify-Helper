const { app } = require('electron')
const SpotifyWebApi = require('spotify-web-api-node')
const dotenv = require('dotenv')

dotenv.config()

app.whenReady().then(async () => {
    const Spotify = new SpotifyWebApi()
    Spotify.setAccessToken(process.env.ACCESS_TOKEN)

    let albums = await Spotify.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE')
    console.log(albums)
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
