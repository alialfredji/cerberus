
import * as hooks from './hooks'
import { init, connect, runQuery } from './els.lib'

// Applies default values to `elasticsearch` config object
const buildConfig = ({ getConfig, setConfig }) => {
    const clusters = Object.keys(getConfig('elasticsearch', {}))
    const config = clusters.reduce((acc, curr) => ({
        ...acc,
        [curr]: {
            nodes: getConfig(`elasticsearch.${curr}.nodes`, '').split(','),
            indexes: getConfig(`elasticsearch.${curr}.indexes`, '').split(','),
        },
    }), {})

    setConfig('elasticsearch', config)
    return config
}

export default async ({ registerAction }) => {
    registerAction({
        hook: '$START_SERVICE',
        name: hooks.SERVICE_NAME,
        trace: __filename,
        handler: async ({ logger }, ctx) => {
            const config = buildConfig(ctx)
            await Promise.all(Object.keys(config).map(async clusterName => {
                await connect({ clusterName, config }, ctx)
                // ping cluster api
                try {
                    await runQuery({ clusterName, method: 'ping' })
                    logger.info(`[elasticsearch] '${clusterName}' cluster is available :)`)
                } catch (err) {
                    throw new Error(`[elasticsearch] '${clusterName}' cluster is down!`)
                }
            }))
        }
    })
}