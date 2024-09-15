let ws

document.addEventListener("DOMContentLoaded", async _ => {
    const name = document.getElementById("name")
    const message = document.getElementById("message")
    const cookies = document.cookie.split(';')

    if (!
        cookies.filter(item => {
            return item.includes('username=')
        }).length
    ) {
        await authFlow()
    } else if (!
        cookies.filter(item => {
            return item.includes('password=')
        }).length
    ) {
        await authFlow()
    } else {
        name.innerHTML = decodeURIComponent(getCookie("username"))
    }

    await setupSocket()

    document.getElementById("send").addEventListener("click", sendMessage)
    message.addEventListener("keypress", function (event) {
        console.log(event)
        if (event.key === "Enter") {
            event.preventDefault()
            sendMessage()
        }
    })

    document.getElementById("logout").addEventListener("click", _ => {
        deleteAllCookies()
        location.reload()
    })

    function addMessages(message) {
        document.getElementById("messageLog").insertAdjacentHTML(
            'beforeend',
            `<p><b>${message.name}</b>: ${message.message}</p>`
        )
    }

    function sendMessage() {
        if (message.value.trim() === "") {
            alert("Please enter your message")
        } else {
            ws.send(JSON.stringify({
                type: "message",
                data: {
                    message: message.value
                }
            }))
            message.value = ""
            message.focus()
            message.setSelectionRange(0, 0)
        }
    }

    async function setupSocket() {
        ws = new WebSocket(`wss://${window.location.host}`)
        ws.onopen = function () {
            console.log("Socket connection is open")
            ws.send(JSON.stringify({ type: "open", data: {} }))
        }
        ws.onmessage = async function (event) {
            console.log("Message received")
            const msg = JSON.parse(event.data)
            if (msg.type === "fail") {
                await swal({
                    title: "Login failed",
                    text: "Invalid username/password",
                    icon: "error"
                })
                deleteAllCookies()
                location.reload()
            } else {
                console.log(msg.data)
                addMessages(msg.data)
            }
        }

    }

    async function authFlow() {
        const authMethod = await swal({
            title: "Authentication required",
            text: "You must login/signup to continue",
            icon: "warning",
            buttons: {
                signup: {
                    text: "Sign up",
                    value: "signup",
                },
                login: {
                    text: "Login",
                    value: "login",
                },
            },
            closeOnClickOutside: false,
            closeOnEsc: false
        })

        if (authMethod === "signup") {
            const username = await swal("Create a username:", {
                content: "input",
                closeOnClickOutside: false,
                closeOnEsc: false
            })
            const password = await swal("Create a password:", {
                content: {
                    element: "input",
                    attributes: {
                        type: "password",
                        autocomplete: "new-password"
                    }
                },
                closeOnClickOutside: false,
                closeOnEsc: false
            })

            const response = await fetch(`https://${window.location.host}/signup`, {
                method: "POST",
                body: JSON.stringify({ username, password })
            })

            if (response.ok) {
                document.cookie = `username=${encodeURIComponent(username)}; Secure;`
                document.cookie = `password=${encodeURIComponent(password)}; Secure;`
                name.innerHTML = username
            } else {
                await swal({
                    title: "Signup failed",
                    text: "Username already taken",
                    icon: "error"
                })
                location.reload()
            }
        } else if (authMethod === "login") {
            const username = await swal("Enter your username:", {
                content: "input",
                closeOnClickOutside: false,
                closeOnEsc: false
            })

            const password = await swal("Enter your password:", {
                content: {
                    element: "input",
                    attributes: {
                        type: "password",
                        autocomplete: "current-password"
                    }
                },
                closeOnClickOutside: false,
                closeOnEsc: false
            })

            document.cookie = `username=${encodeURIComponent(username)}; Secure;`
            document.cookie = `password=${encodeURIComponent(password)}; Secure;`
            name.innerHTML = username
        }
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(';').shift()
    }

    function deleteAllCookies() {
        const cookies = document.cookie.split(";")

        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i]
            let eqPos = cookie.indexOf("=")
            let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
    }
})