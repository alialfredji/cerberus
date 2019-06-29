

let isEnabled = 'no'
let AWS
let config

const { date2obj } = require('./dates')

const defaultKey = (id, type, vendor = 'default') => {
    const date = date2obj(new Date())
    return `${vendor}/${type}/key-sort/${id}/${date.YYYY}/${date.MM}/${date.DD + date.hh + date.mm + date.ss}`
}

const dateKey = (id, type, vendor = 'default') => {
    const date = date2obj(new Date())
    return `${vendor}/${type}/date-sort/${date.YYYY}/${date.MM}/${id}/${date.DD + date.hh + date.mm + date.ss}`
}

const set = async (options = {}) => new Promise((resolve, reject) => {
    if (isEnabled !== 'yes') resolve()

    new AWS.S3(config).putObject({
        Bucket: config.bucket,
        Key: options.key,
        Body: options.body,
    }, (err, data) => err ? reject(err) : resolve(data))
})

const get = (options = {}) => new Promise((resolve, reject) => {
    if (isEnabled !== 'yes') resolve()

    new AWS.S3(config).getObject({
        Bucket: config.bucket,
        Key: options.key,
    }, (err, data) => err ? reject(err) : resolve(data))
})

const getList = (options = {}) => new Promise((resolve, reject) => {
    if (isEnabled !== 'yes') resolve()

    new AWS.S3(config).listObjects({
        Bucket: config.bucket,
        Prefix: options.prefix,
        MaxKeys: options.maxKeys,
        Delimiter: options.delimiter,
        Marker: options.marker,
    }, (err, data) => err ? reject(err) : resolve(data))
})

const storeProfileIds = ({ id, json, vendor, type }) =>
    set({
        body: JSON.stringify(json),
        key: `${vendor}/${type}/${id}.txt`,
    })

// store json to .txt file
const storeJSON = ({ id, type, vendor, json }) => Promise.all([
    set({
        body: JSON.stringify(json),
        key: `${defaultKey(id, type, vendor)}.txt`,
    }),
    set({
        body: JSON.stringify(json),
        key: `${dateKey(id, type, vendor)}.txt`,
    }),
])

// extract json from .txt file
const getJSON = async (key) => {
    const file = await get({ key: `${key}.txt` })
    const bodyString = file.Body.toString()
    return JSON.parse(bodyString)
}

const register = ({ registerAction, settings }) => {
    const { hooksLib, awsLib } = settings
    const { SERVICE, INIT_SERVICES, START_SERVICES } = hooksLib

    registerAction({
        hook: INIT_SERVICES,
        name: `${SERVICE} aws`,
        trace: __filename,
        handler: ({ s3Store }) => {
            isEnabled = s3Store.isEnabled
            AWS = awsLib
            config = s3Store.config
        },
    })
}

module.exports = {
    // aws functions
    set,
    get,
    getList,

    // json handlers
    getJSON,
    storeJSON,
    storeProfileIds,

    register,
}