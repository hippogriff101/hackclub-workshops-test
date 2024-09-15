const socket = io()

function increment() {
    socket.emit("click")
}

socket.on('up', (msg) => {
    console.log(msg)
    document.getElementById("count").innerHTML = msg
})