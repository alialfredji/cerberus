
// import * as queries from './api.queries'
import request from 'superagent'
import * as hooks from './hooks'

let config = {}
let queries = {}

export const init = async (_config, ctx) => {
    config = _config

    await ctx.createHook.serie(hooks.API_INIT, {
        registerQuery: (queryName, queryString) => (queries[queryName] = queryString),
    })
}

export const execRaw = async (query, variables) => {
    try {
        const res = await request
            .post(config.endpoint)
            .set('Accept', 'application/json')
            .send({
                query,
                variables: {
                    ...variables,
                    token: config.token,
                }
            })

        return res.body
    } catch (err) {
        throw err.response.body
    }
}

export const exec = (name, variables) => {
    const query = queries[name]
    if (!query) {
        throw new Error(`query: "${name}" does not exists`)
    }

    return execRaw(query, variables)
}