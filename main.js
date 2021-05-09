const { app, BrowserWindow, ipcMain } = require('electron')
const SpotifyWebApi = require('spotify-web-api-node')
const dotenv = require('dotenv')
const path = require('path')
function debounce(func, timeout = 300) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(this, args)
        }, timeout)
    }
}

dotenv.config()

app.whenReady().then(async () => {
    const Spotify = new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI,
        refreshToken: process.env.REFRESH_TOKEN
    })
    await refreshToken()
    setInterval(async () => {
        await refreshToken()
    }, 3500000)

    async function refreshToken() {
        let refreshTokenResult = await Spotify.refreshAccessToken()
        Spotify.setAccessToken(refreshTokenResult.body.access_token)
    }

    let win = new BrowserWindow({
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadFile(path.join(__dirname, 'index.html'))
    win.webContents.openDevTools()
    ipcMain.on('sendData', async (error, data) => {
        switch (data) {
            case 'Clap':
                let playingState = await Spotify.getMyCurrentPlaybackState()
                if (playingState.body.is_playing) {
                    await Spotify.pause()
                } else {
                    await Spotify.play()
                }
                break
            case 'Snap':
                await Spotify.skipToNext()
                break
        }
    })
    /* DopeAdder(Spotify) */
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

function DopeAdder(Spotify) {
    let timeToAdd = 20
    let dope = '2pyjH91WD16a4rdzlBzM3Q'

    let currentTrack = ''
    let timeLeft = timeToAdd

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
            refreshToken()
        }
    }, 3000)
}
