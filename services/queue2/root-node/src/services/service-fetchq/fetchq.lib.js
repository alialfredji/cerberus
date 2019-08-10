
import fetchq from 'fetchq'

let client = null

export const init = (config) => {
    client = fetchq(config)
}

export const start = async (config, ctx) => {
    try {
        // make sure fetchq is properly initialized
        await client.start()
        await client.init()

        // upsert all the queues that we need
        await Promise.all(config.queues.map(name => (
            client.queue.create(name)
        )))

        await Promise.all(config.queues.map(name => (
            client.queue.enableNotifications(name, true)
        )))
    } catch (err) {
        ctx.logger.info('Problem starting fetchq, retrying in 3 seconds')
        setTimeout(() => start(config, ctx), 3000)
    }
}

export const getClient = () => client
