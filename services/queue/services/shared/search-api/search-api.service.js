
let request
let config = {}

const init = (_config, { requestLib }) => {
    config = _config
    request = requestLib
}

const execRaw = async (query, variables) => {
    let res = null
    try {
        res = await request
            .post(config.endpoint)
            .set('Accept', 'application/json')
            .send({
                query,
                variables: {
                    ...variables,
                    token: config.token,
                }
            })

    } catch (err) {
        throw err.response.body
    }

    // graphql error
    if (res.body.errors && res.body.errors.length) {
        throw new Error(res.body.errors[0].message)
    }

    return res.body
}

module.exports = {
    init,
    execRaw,
}
