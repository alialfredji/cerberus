
const hooks = require('@forrestjs/hooks')
const config = require('@marcopeg/utils/lib/config')
const env = require('@forrestjs/service-env')
const fetchq = require('fetchq')
const moment = require('moment')
const aws = require('aws-sdk')
const pg = require('@forrestjs/service-postgres')
const request = require('superagent')

require('../../shared/worker-node').start({
    libs: {
        getConfig: config.get,
        env,
        moment,
        fetchq,
        hooks,
        aws,
        pg,
        request,
    },
    queues: {
        'profile_builder': {},
        'profile_lang': {},
    },
    workers: [
        require('./builder'),
    ],
})

// setTimeout(() => {
//     require('./profile').handler({
//         subject: 285323558,
//     }, {
//         ctx: {
//             logger: {
//                 error: () => null,
//                 verbose: () => null,
//                 info: () => null,
//                 debug: () => null,
//             },
//         }
//     })
// }, 1000)