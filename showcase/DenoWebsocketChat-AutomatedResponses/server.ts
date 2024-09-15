import { serve } from "https://deno.land/std@0.75.0/http/server.ts"
import { acceptWebSocket, WebSocket } from "https://deno.land/std@0.75.0/ws/mod.ts"

const server = serve(":8080")
console.log(`Chat server is running on 8080`)

let users: WebSocket[] = []

for await (const req of server) {
    try {
        const { conn, r: bufReader, w: bufWriter, headers } = req
        let socket = await acceptWebSocket({
            conn,
            bufReader,
            bufWriter,
            headers,
        })

        try {
            handleWs(socket)
        } catch (err) {
            console.error(`failed to receive frame: ${err}`)

            if (!socket.isClosed) {
                await socket.close(1000).catch(console.error)
            }
        }

    } catch (error) {
        if (req.url === "/") {
            req.url = "/index.html"
        }
        try {
            const data = await Deno.readTextFile(req.url.substring(1))
            await req.respond({ status: 200, body: data })
        } catch {
            await req.respond({ status: 404 })
        }
    }
}

async function handleWs(socket: WebSocket) {
    const responseMaps: [RegExp, string][] = [
        [/\bhi\b|\bhey\b|\bhello\b|\bsup\b/gmi, "Hello there!"],
        [/\bbye\b|\bgtg\b/gmi, "Bye!"],
        [/creeper/gmi, "aw man"]
    ]

    for await (const event of socket) {
        if (typeof event === "string") {
            const parsedEvent = JSON.parse(event)
            if (parsedEvent.type === "open") {
                console.log("Connection established with a client.")
                users.push(socket)

                await socket.send(JSON.stringify({
                    type: "message",
                    data: {
                        name: "SERVER",
                        message: "Hello, welcome to the webchat!"
                    }
                }))
            } else if (parsedEvent.type === "message") {
                console.dir(parsedEvent)

                let serverResp: string

                for (const map of responseMaps) {
                    if (parsedEvent.data.message.match(map[0])) {
                        serverResp = map[1]
                        break;
                    }
                }

                users = users.filter(user => {
                    try {
                        user.send(JSON.stringify(parsedEvent))
                        if (serverResp) {
                            user.send(JSON.stringify({
                                type: "message",
                                data: {
                                    name: "SERVER",
                                    message: serverResp
                                }
                            }))
                        }
                        return true
                    } catch { // User closed connection
                        return false
                    }
                })
                console.log(`There ${users.length === 1 ? "is" : "are"} ${users.length} ${users.length === 1 ? "user" : "users"} online`)

            }
        }
    }
}