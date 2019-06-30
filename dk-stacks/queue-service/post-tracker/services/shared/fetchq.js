
// fetchQ client
let client

const getClient = () => client

const start = async () => {
    try {
        await client.start()
        await client.init()

        // upsert all the queues that we need
        const initQueuesPromises = Object.keys(client.settings.queues)
            .map(name => client.queue.create(name))

        // enable queues notification
        const activateQueuesNotificationsPromises = Object.keys(client.settings.queues)
            .map(name => client.queue.enableNotifications(name, true))

        await Promise.all(initQueuesPromises)
        await Promise.all(activateQueuesNotificationsPromises)
    } catch (err) {
        client.logger.info('Problem starting fetchq, retrying in 3 seconds')
        setTimeout(start, 3000)
    }
}

const register = ({ registerAction, settings }) => {
    const { hooksLib, fetchqLib } = settings
    const { SERVICE, START_SERVICES, INIT_SERVICES } = hooksLib

    registerAction({
        hook: INIT_SERVICES,
        name: `${SERVICE} fetchq`,
        trace: __filename,
        handler: ({ fetchq }) => {
            client = fetchqLib(fetchq)
        },
    })

    registerAction({
        hook: START_SERVICES,
        name: `${SERVICE} fetchq`,
        trace: __filename,
        handler: start,
    })
}

module.exports = {
    register,
    start,
    getClient,
}
