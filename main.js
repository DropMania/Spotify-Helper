const { app } = require('electron')
const SpotifyWebApi = require('spotify-web-api-node')
const dotenv = require('dotenv')

let timeToAdd = 3
let dope = '2pyjH91WD16a4rdzlBzM3Q'

dotenv.config()

app.whenReady().then(async () => {
    const Spotify = new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI,
        refreshToken: process.env.REFRESH_TOKEN
    })
    let currentTrack = ''
    let timeLeft = timeToAdd
    await refreshToken()
    async function refreshToken() {
        let refreshTokenResult = await Spotify.refreshAccessToken()
        Spotify.setAccessToken(refreshTokenResult.body.access_token)
    }

    setInterval(async () => {
        let playingState = await Spotify.getMyCurrentPlaybackState()
        try {
            if (playingState.body.item) {
                if (playingState.body.item.type == 'track') {
                    if (playingState.body.item.uri != currentTrack) {
                        currentTrack = playingState.body.item.uri
                        timeLeft = timeToAdd
                    } else {
                        if (playingState.body.is_playing) {
                            timeLeft--
                        }
                        if (timeLeft == 0) {
                            if (currentTrack != '') {
                                let playlist = await Spotify.getPlaylistTracks(
                                    dope
                                )
                                let tracks = playlist.body.items.map(
                                    (t) => t.track.uri
                                )
                                if (!tracks.includes(currentTrack)) {
                                    Spotify.addTracksToPlaylist(dope, [
                                        currentTrack
                                    ])
                                    console.log(
                                        'Track added!: ',
                                        playingState.body.item.name
                                    )
                                }
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.log('oops', e)
            /* refreshToken() */
        }
    }, 3000)
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})
