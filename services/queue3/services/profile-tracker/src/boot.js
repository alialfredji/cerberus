/**
 * This server setup uses hooks:
 * https://marcopeg.com/hooks/
 *
 * It's going to be a breeze to develop interconnected features!
 * Forget about messy code and huge routing folders, learn how
 * to think in features and organize your codebase around your real
 * business requirements instead ;-)
 */
import { registerAction, SETTINGS, FINISH } from '@forrestjs/hooks'
import { createHookApp, logBoot } from '@forrestjs/hooks'


/**
 * polyfill "fetch" in NodeJS
 * this is used by your client app to make requests while rendering on the server
 * */
require('es6-promise').polyfill()
require('isomorphic-fetch')

/**
 * App's Configuration
 * -------------------
 *
 * Most of the available services and features have default values that suit
 * the general needs (at least for me) and you may just like things the way they are.
 *
 * Anyway, this is the hook where you should grab any environment defined setting
 * and import into your application's context.
 *
 * Take a look at the `.env` file where I wrote some basic configuration that
 * many modules are able to read, and feel free to extend the `settings` object
 * with custom informations.
 *
 * Any new hook that you may need to register will receive those settings.
 */
registerAction({
    hook: SETTINGS,
    name: '♦ boot',
    handler: async ({ setConfig, getEnv, getConfig }) => {
        setConfig('fetchq', {
            logLevel: getEnv('LOG_LEVEL', 'info'),
            connect: {
                host: getEnv('PG_HOST'),
                port: getEnv('PG_PORT'),
                database: getEnv('PG_DATABASE'),
                user: getEnv('PG_USERNAME'),
                password: getEnv('PG_PASSWORD'),
            },
        })

        // setConfig('elasticsearch', {
        //     'default': {
        //         nodes: getEnv('ELS_NODES'),
        //         indexes: getEnv('ELS_INDEXES'),
        //     },
        // })

        setConfig('postgres.connections', [{
            connectionName: 'storage-pg',
            host: getEnv('STORAGE_PG_HOST'),
            port: getEnv('STORAGE_PG_PORT'),
            database: getEnv('STORAGE_PG_DATABASE'),
            username: getEnv('STORAGE_PG_USERNAME'),
            password: getEnv('STORAGE_PG_PASSWORD'),
            maxAttempts: Number(getEnv('STORAGE_PG_MAX_CONN_ATTEMPTS', 25)),
            attemptDelay: Number(getEnv('STORAGE_PG_CONN_ATTEMPTS_DELAY', 5000)),
            models: [],
        }])

        // setConfig('api', {
        //     token: getEnv('API_TOKEN'),
        //     endpoint: getEnv('API_ENDPOINT'),
        // })
    },
})


/**
 * Log hooks' boot tree in development
 * take a look at your console to visualize how each hook connects
 * with the rest of the application.
 */
process.env.NODE_ENV === 'development' && registerAction({
    hook: FINISH,
    name: '♦ boot',
    handler: () => logBoot(),
})


/**
 * App's Capabilities
 * ------------------
 *
 * Here is where you define all that your app can do:
 *
 * SERVICES are very generic and **business unaware** modules. They offer
 * capabilities that you generally need across very different applications,
 * like an Express app or a GraphQL endpoint.
 *
 * FEATURES are **business aware** modules that make sense only for this specific
 * application. Usually you write your data store models, routes or GraphQL
 * queries in a feature implementing one or more hooks.
 */

import { workers } from './features/instagram-fetchq'

export default createHookApp({
    services: [
        require('@forrestjs/service-env'),
        require('@forrestjs/service-logger'),
        require('@forrestjs/service-postgres'),
        require('./services/service-fetchq'),
        // require('./services/service-api'),
    ],
    features: [
        require('./features/instagram-fetchq'),
        require('./features/instagram-pg-storage'),

        // node processes
        ['$FETCHQ_INIT', ({ registerWorker }, ctx) => {
            registerWorker([
                workers.profileWorker(ctx),
            ])
        }],
    ],
})
