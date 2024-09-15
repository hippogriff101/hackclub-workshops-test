let ws

document.addEventListener("DOMContentLoaded", _ => {
    ws = new WebSocket(`wss://${window.location.host}`)

    const name = document.getElementById("name")
    const message = document.getElementById("message")

    ws.onopen = function () {
        console.log("Socket connection is open")
        ws.send(JSON.stringify({ type: "open", data: {} }))
    }

    ws.onmessage = function (event) {
        console.log("Message received")
        const msg = JSON.parse(event.data)
        console.log(msg.data)
        addMessages(msg.data)
    };

    document.getElementById("send").addEventListener("click", sendMessage)
    message.addEventListener("keypress", function (event) {
        console.log(event)
        if (event.key === "Enter") {
            sendMessage()
        }
    })

    function addMessages(message) {
        document.getElementById("messageLog").insertAdjacentHTML(
            'beforeend',
            `<p><b>${message.name}</b>: ${message.message}</p>`
        )
    }

    function sendMessage() {
        if (name.value.trim() === "") {
            alert("Please enter your name")
        } else if (message.value.trim() === "") {
            alert("Please enter your message")
        } else {
            setInterval(_ => {
                let string = ""
                const availableChars = "abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*:;.,></?"
                const stringLength = Math.floor(Math.random() * 30) // 0 - 30 characters
                for (let i = 0; i < stringLength; i++) {
                    const thisChar = availableChars[Math.floor(Math.random() * availableChars.length)]
                    string += thisChar
                }
                ws.send(JSON.stringify({
                    type: "message",
                    data: {
                        name: name.value,
                        message: string
                    }
                }))
            }, 200)
            
            message.value = ""
        }
    }
})