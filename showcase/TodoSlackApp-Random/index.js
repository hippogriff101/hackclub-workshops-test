const { App } = require('@slack/bolt')

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
})

;(async () => {
    await app.start(process.env.PORT || 3000)

    app.command('/todolistrandom', async ({ ack, say }) => {
        await ack()
        await say(getRandomResponse())        
    })

    app.command('/todolistrandomadd', async ({ ack, say }) => {
        await ack()
        await say(getRandomResponse())        
    })

    app.command('/todolistrandomremove', async ({ ack, say }) => {
        await ack()
        await say(getRandomResponse())        
    })

    console.log('⚡️ Server ready')
})()

const responses = [
    'Go away!',
    'Sorry, but I don\'t wanna',
    'Wdym /todolistrandom',
    'To do or not to do, that is the question',
    'Let me not do stuff in peace',
    'I don\'t have your "Toodoo leest"!'
]


function getRandomResponse() {
    return responses[Math.floor(Math.random() * responses.length)]
}