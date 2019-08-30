
const hooks = require('@forrestjs/hooks')
const config = require('@marcopeg/utils/lib/config')
const env = require('@forrestjs/service-env')
const fetchq = require('fetchq')
const moment = require('moment')
const aws = require('aws-sdk')
const pg = require('@forrestjs/service-postgres')

require('../../shared/worker-node').start({
    libs: {
        getConfig: config.get,
        env,
        moment,
        fetchq,
        hooks,
        aws,
        pg,
    },
    queues: {
        'profile_tracker': {},
        'lost_profile': {},
        'profile_builder': {},
        'profile_lang': {},
        // 'post_tracker': {},
    },
    workers: [
        require('./profile'),
        // require('./post-tracker'),
        // require('./post-tracker'),
        // require('./post-tracker'),
        // require('./post-tracker'),
    ],
})