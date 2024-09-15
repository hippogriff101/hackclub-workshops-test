const { App } = require('@slack/bolt')

const Client = require("@replit/database")
const database = new Client()

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
})

;(async () => {
    await app.start(process.env.PORT || 3000)

    app.command('/todolistplus', async ({ command, ack, say }) => {
        await ack()

        let currentUserTodo = JSON.parse(await database.get(command.user_id)) || []
        let response = ""

        currentUserTodo.forEach((todo, index) => {
            response += `\n${index + 1}. ${todo}`
        })

        if (response) {
            await say("Your todo list:" + response)
        } else {
            await say(`Your todo list is currently empty!`)
        }
    })

    app.command('/todolistplusadd', async ({ command, ack, say }) => {
        await ack()
        let currentUserTodo = JSON.parse(await database.get(command.user_id)) || []
        currentUserTodo.push(command.text)
        await database.set(command.user_id, JSON.stringify(currentUserTodo))
        await say(`Added\n• ${command.text}\n to your todo list`)
    })

    app.command('/todolistplusremove', async ({ command, ack, say }) => {
        await ack()
        let currentUserTodo = JSON.parse(await database.get(command.user_id)) || []
        let removed = currentUserTodo[command.text - 1]
        currentUserTodo.splice(command.text - 1, 1)
        await database.set(command.user_id, JSON.stringify(currentUserTodo))
        await say(`Removed\n• ${removed}\n from your todo list`)
    })

    app.command('/todolistplusdo', async ({ command, ack, say }) => {
        await ack()
        let currentUserTodo = JSON.parse(await database.get(command.user_id)) || []
        currentUserTodo[command.text - 1] = `~${currentUserTodo[command.text - 1]}~`
        await database.set(command.user_id, JSON.stringify(currentUserTodo))
        await say(`Marked\n${command.text}. ${currentUserTodo[command.text - 1]}\n as done in your todo list`)
    })

    app.command('/todolistplusundo', async ({ command, ack, say }) => {
        await ack()
        let currentUserTodo = JSON.parse(await database.get(command.user_id)) || []
        currentUserTodo[command.text - 1] = currentUserTodo[command.text - 1].slice(1, -1)
        console.log(typeof currentUserTodo[command.text - 1])
        await database.set(command.user_id, JSON.stringify(currentUserTodo))
        await say(`Marked\n${command.text}. ${currentUserTodo[command.text - 1]}\n as not done in your todo list`)
    })

    console.log('⚡️ Server ready')
})()