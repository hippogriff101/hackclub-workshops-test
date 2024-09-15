import { Application, send } from "https://deno.land/x/oak@v6.3.1/mod.ts"
import { exists } from "https://deno.land/std/fs/mod.ts"

const app = new Application()
app.use(async (ctx) => {
    let data
    if (await exists("./cache.json")) {
        data = JSON.parse(await Deno.readTextFile('cache.json'))
    } else {
        let users = await fetch(
            "https://scrapbook.hackclub.com/api/users/"
        ).then((r) => r.json())
        users = users.filter((u: any) => u.updatesCount != 0)
        await Deno.writeTextFile("cache.json", JSON.stringify(users))
    }

    let user = data[Math.floor(Math.random() * data.length)]
    ctx.response.body = JSON.stringify(user)
})

app.addEventListener("listen", ({ hostname, port, secure }) => {
    console.log(
        `Listening on: ${secure ? "https://" : "http://"}${
        hostname ?? "localhost"
    }:${port}`
    )
})

await app.listen({ port: 8000 })