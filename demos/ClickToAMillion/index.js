const express = require('express')
const app = express()
app.use(express.static('public'))
const http = require('http').createServer(app)
const io = require('socket.io')(http)

http.listen(3000, () => {
  console.log('listening on *:3000')
})

let count = 0
io.on('connection', (socket) => {
    socket.emit('up', count)
    socket.on('click', _ => {
        count += 1
        io.emit('up', count)
    })
})