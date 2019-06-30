
const hooks = require('@forrestjs/hooks')
const config = require('@marcopeg/utils/lib/config')
const env = require('@forrestjs/service-env')
const fetchq = require('fetchq')
const moment = require('moment')
const aws = require('aws-sdk')

require('../../shared/worker-node').start({
    libs: {
        getConfig: config.get,
        env,
        moment,
        fetchq,
        hooks,
        aws,
    },
    queues: {
        'post_tracker': {},
    },
    workers: [
        require('./post'),
    ],
})