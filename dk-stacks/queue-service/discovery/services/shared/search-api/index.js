
const { init, execRaw } = require('./search-api.service')
const queries = require('./search-api.queries')

const register = ({ registerAction, settings }) => {
    const { SERVICE, INIT_SERVICES } = settings.hooksLib

    registerAction({
        hook: INIT_SERVICES,
        name: `${SERVICE} search-api`,
        trace: __filename,
        handler: ({ searchApi }) => init(searchApi, settings),
    })
}

module.exports = {
    register,
    queries,
    execRaw,
}