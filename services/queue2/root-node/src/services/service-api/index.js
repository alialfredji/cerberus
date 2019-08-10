
import * as hooks from './hooks'
import { init } from './api.lib'

// Applies default values to `api` config object
const buildConfig = ({ getConfig, setConfig }) => {
    const config = {
        ...getConfig('api', {}),
        token: getConfig('api.token', 'test-token'),
        endpoint: getConfig('api.endpoint', 'http://localhost:8080/api'),
    }

    setConfig('api', config)
    return config
}

export default ({ registerHook, registerAction }) => {
    registerHook(hooks)

    registerAction({
        hook: '$INIT_SERVICE',
        name: hooks.SERVICE_NAME,
        trace: __filename,
        handler: async (options, ctx) => {
            const config = buildConfig(ctx)
            await init(config, ctx)
        },
    })
}