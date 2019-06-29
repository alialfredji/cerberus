
const start = async (config) => {
    const { libs, workers, queues } = config
    const { hooks, getConfig, env, moment, fetchq, aws } = libs 
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

                settings.s3Store = {
                    config: {
                        accessKeyId: getConfig('AWS_ACCESS_KEY'),
                        secretAccessKey: getConfig('AWS_SECRET_ACCESS_KEY'),
                        region: getConfig('AWS_REGION'),
                        bucket: getConfig('AWS_BUCKET'),
                    },
                    isEnabled: getConfig('AWS_ENABLE_BACKUP'),
                }
                console.log(getConfig('AWS_ENABLE_BACKUP'))
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
            },
            services: [
                env,
                require('./fetchq'),
                require('./dates'),
                require('./aws'),
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