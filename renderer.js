const { ipcRenderer } = require('electron')
const classifier = ml5.soundClassifier(
    'https://teachablemachine.withgoogle.com/models/npAfCYbI0/model.json',
    { probabilityThreshold: 0.9 },
    modelReady
)
function modelReady() {
    classifier.classify((error, result) => {
        let res = result.sort((a, b) => {
            a.confidence - b.confidence
        })[0]
        console.log(res.label)

        ipcRenderer.send('sendData', res.label)
    })
}
