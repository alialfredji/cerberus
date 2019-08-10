import * as hooks from './hooks'
import { init, start } from './fetchq.lib'

// Applies default values to `fetchq` config object
const buildConfig = ({ getConfig, setConfig }) => {
    const config = {
        ...getConfig('fetchq', {}),
        connect: getConfig('fetchq.connect', {}),
        logLevel: getConfig('fetchq.logLevel', 'info'),
        workers: getConfig('fetchq.workers', []),
        maintenance: getConfig('fetchq.maintenance', {
            limit: 3,
            sleep: 1500,
        }),
        queues: getConfig('fetchq.queues', []),
    }

    setConfig('fetchq', config)
    return config
}


export default ({ registerHook, registerAction }) => {
    registerHook(hooks)

    const defaults = {
        name: hooks.SERVICE_NAME,
        trace: __filename,
    }

    registerAction({
        ...defaults,
        hook: '$INIT_SERVICE',
        handler: async ({}, ctx) => {
            const config = buildConfig(ctx)
            
            await ctx.createHook.serie(hooks.FETCHQ_INIT, {
                registerWorker: (workerPath) => (
                    Array.isArray(workerPath)
                        ? workerPath.forEach(path => config.workers.push(path))
                        : config.workers.push(workerPath)
                ),
                registerQueue: (queueName) => (
                    Array.isArray(queueName)
                        ? queueName.forEach(name => config.queues.push(name))
                        : config.queues.push(queueName)
                ),
            })
            
            await init(config, ctx)
        },
    })

    registerAction({
        ...defaults,
        hook: '$START_SERVICE',
        handler: async ({}, ctx) => {
            const config = buildConfig(ctx)
            await start(config, ctx)
        },
    })
}