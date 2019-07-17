
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
        'directory': {},
        'city': {},
        'country': {},
        'location': {},
        'post': {},
        'post_tracker': {},
        'first_blood': {},
    },
    workers: [
        require('./directory'),
        require('./country'),
        require('./city'),
        require('./location'),
        require('./post'),
        require('./post'),
        require('./post-tracker'),
        require('./post-tracker'),
        require('./post-tracker'),
        require('./post-tracker'),
        require('./post-tracker'),
        require('./post-tracker'),
        require('./post-tracker'),
        require('./post-tracker'),
    ],
})