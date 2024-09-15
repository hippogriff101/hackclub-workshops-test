const { App } = require('@slack/bolt')

const Client = require("@replit/database")
const database = new Client()

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
})

async function main() {
    await app.start(process.env.PORT || 3000)

    app.command('/todolistcommunity', async ({ command, ack, say }) => {
        await ack()

        let currentUserTodo = JSON.parse(await database.get("common")) || []
        let response = ""

        currentUserTodo.forEach((todo, index) => {
            response += `\n${index + 1}. ${todo}`
        })

        if (response) {
            await say("The community todo list:" + response)
        } else {
            await say(`The community todo list is currently empty!`)
        }
    })

    app.command('/todolistcommunityadd', async ({ command, ack, say }) => {
        await ack()
        let currentUserTodo = JSON.parse(await database.get("common")) || []
        currentUserTodo.push(command.text)
        await database.set("common", JSON.stringify(currentUserTodo))
        await say(`Added\n• ${command.text}\n to the todo list`)
    })

    app.command('/todolistcommunityremove', async ({ command, ack, say }) => {
        await ack()
        let currentUserTodo = JSON.parse(await database.get("common")) || []
        let removed = currentUserTodo[command.text - 1]
        currentUserTodo.splice(command.text - 1, 1)
        await database.set("common", JSON.stringify(currentUserTodo))
        await say(`Removed\n• ${removed}\n from the todo list`)
    })

    console.log('⚡️ Server ready')
}

main()