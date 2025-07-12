const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const events = require('events')
const timeUpEvent = new events.EventEmitter()

io.on('connection', (socket) => {socket.emit('connected')
    console.log("A user connected!")
})

app.use(express.static('public'))
http.listen(3000, () => {
    console.log('listening on *:3000')
})

const questions = [{
    text: "Hello! What is 1+1?",
    time: 10, // In seconds
    answers: [
        "-1",
        "7",
        "3",
        "2"
    ],
    correctAnswer: "2"
}, 
{
    text: "What is this event called?",
    time: 10, // In seconds
    answers: [
        "Europe Hackathon",
        "Hack Club UK",
        "EuroHacks",
        "Hackathon Europe"
    ],
    correctAnswer: "EuroHacks"
}, 
]

let userPointsMap = {
    /*
    The keys will be the socket IDs, and the values will be arrays. 
    The first element of the array will be the Player's name,
    and the second will be the amount of points they currently have.

    <SOCKETID>: ["<PLAYERNAME>", <POINTS>]

    Example: 
    
    dfwaogruhdslfsdljf: ["Khushraj", 0]
    */
   
}

