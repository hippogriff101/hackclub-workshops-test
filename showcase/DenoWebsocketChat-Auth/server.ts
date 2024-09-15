import { Application } from "https://deno.land/x/oak@v6.3.1/mod.ts"
import { acceptWebSocket, WebSocket } from "https://deno.land/std@0.73.0/ws/mod.ts"
import { login, signUp } from "./auth.ts"

const app = new Application()
console.log(`Chat server is running on 8080`)

let users: WebSocket[] = []

app.use(async (ctx) => {
    try {
        const { conn, r: bufReader, w: bufWriter, headers } = ctx.request.serverRequest

        let socket = await acceptWebSocket({
            conn,
            bufReader,
            bufWriter,
            headers,
        })

        try {
            // @ts-ignore
            await login(decodeURIComponent(ctx.cookies.get("username")), decodeURIComponent(ctx.cookies.get("password")))

            try {
                await handleWs(socket, ctx.cookies.get("username")!)
            } catch (err) {
                console.error(`failed to receive frame: ${err}`)

                if (!socket.isClosed) {
                    await socket.close(1000).catch(console.error)
                }
            }
        } catch (err) {
            console.log(err)
            await socket.send(JSON.stringify({
                type: "fail"
            }))
            socket.close()
        }
    } catch (error) {
        let url = ctx.request.url.pathname
        if (url === "/signup") {
            ctx.response.headers.set("Cache-Control", "no-cache")
            try {
                const options = await ctx.request.body({ type: "json" }).value
                if (!(options.username || options.password)) throw "Bad request"
                try {
                    await signUp(decodeURIComponent(options.username), decodeURIComponent(options.password))
                    ctx.response.status = 204
                } catch {
                    ctx.response.status = 409
                    ctx.response.body = "Username already taken"
                }
            } catch (error) {
                ctx.response.status = 400
            }
        } else {
            try {
                let data 
                if (url === "/" || url === "/index.html") {
                    ctx.response.headers.set("Content-Type", "text/html")
                    data = await Deno.readTextFile("index.html") 
                } else if (url === "/styles.css") {
                    ctx.response.headers.set("Content-Type", "text/css")
                    data = await Deno.readTextFile("styles.css")
                } else if (url === "/frontend.js") {
                    ctx.response.headers.set("Content-Type", "text/javascript")
                    data = await Deno.readTextFile("frontend.js")
                } else {
                    throw 404
                }

                ctx.response.status = 200
                ctx.response.body = data
            } catch {
                ctx.response.status = 404
            }
        }
    }
})

async function handleWs(socket: WebSocket, username: string) {
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
                parsedEvent.data.name = username
                users = users.filter(user => {
                    try {
                        user.send(JSON.stringify(parsedEvent))
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


app.addEventListener("listen", ({ hostname, port, secure }) => {
    console.log(
        `Listening on: ${secure ? "https://" : "http://"}${
        hostname ?? "localhost"
    }:${port}`
    )
})

await app.listen({ port: 8000 })