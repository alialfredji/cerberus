
const start = async (config) => {
    const { libs, workers, queues } = config
    const { hooks, getConfig, env, moment, fetchq, aws, pg, request } = libs 
    const { registerAction, runHookApp, logBoot, FINISH, SETTINGS, } = hooks

    // run hook app
    try {
        registerAction({
            hook: SETTINGS,
            name: '♦ boot',
            handler: async ({ settings }) => {
                settings.fetchq = {
                    logLevel: getConfig('LOG_LEVEL', 'info'),
                    connect: {
                        host: getConfig('PG_HOST'),
                        port: getConfig('PG_PORT'),
                        database: getConfig('PG_DATABASE'),
                        user: getConfig('PG_USERNAME'),
                        password: getConfig('PG_PASSWORD'),
                    },
                    maintenance: {
                        limit: 3,
                        sleep: 1500,
                    },
                    workers,
                    queues,
                }

                settings.postgres = [
                    {
                        connectionName: 'storage-pg',
                        host: getConfig('STORAGE_PG_HOST'),
                        port: getConfig('STORAGE_PG_PORT'),
                        database: getConfig('STORAGE_PG_DATABASE'),
                        username: getConfig('STORAGE_PG_USERNAME'),
                        password: getConfig('STORAGE_PG_PASSWORD'),
                        maxAttempts: Number(getConfig('STORAGE_PG_MAX_CONN_ATTEMPTS', 25)),
                        attemptDelay: Number(getConfig('STORAGE_PG_CONN_ATTEMPTS_DELAY', 5000)),
                        models: [],
                        logging: () => {},
                    },
                ]

                settings.searchApi = {
                    token: getConfig('API_TOKEN', ''),
                    endpoint: getConfig('API_ENDPOINT', 'http://localhost:8080/api'),
                }
            }
        })

        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            registerAction({
                hook: FINISH,
                name: '♦ boot',
                handler: () => logBoot(),
            })
        }

        await runHookApp({
            settings: {
                momentLib: moment,
                fetchqLib: fetchq,
                hooksLib: hooks,
                awsLib: aws,
                pgLib: pg,
                requestLib: request,
            },
            services: [
                env,
                pg,
                require('./fetchq'),
                require('./dates'),
                require('./storage-pg'),
                require('./search-api'),
            ],
        })

        // Let Docker exit on Ctrl+C
        process.on('SIGINT', () => process.exit())
    } catch (err) {
        console.log('*** BOOT: Fatal Error');
        console.log(err);
    }
}

module.exports = {
    start,
}