
import { Client } from '@elastic/elasticsearch'

const connections = new Map()

export const connect = ({ clusterName, config }) => new Promise((resolve, reject) => {
    try {
        const clusterConfig = config[clusterName]
        const client = new Client({ nodes: clusterConfig.nodes })

        client.cluster.health({}, err => {
            if (err) reject(err)

            connections.set(clusterName, {
                config: clusterConfig,
                client,
            })

            resolve()
        })
    } catch (err) {
        reject(err)
    }
})

export const validateIndex = ({ clusterName, index }) => {
    const knownIndexes = connections.get(clusterName).config.indexes
    if (index && knownIndexes.indexOf(index) === -1) {
        throw new Error(`[elasticsearch-call] Index '${index}' not among known indexes`)
    }
}

// method example: indices.create, search, update etc.
export const runQuery = ({ clusterName, method, payload = {} }) => {
    validateIndex({ clusterName, index: payload.index })
    if (method === 'reindex') {
        validateIndex({ clusterName, index: payload.body.source.index })
        validateIndex({ clusterName, index: payload.body.dest.index })
    }

    let action
    const client = connections.get(clusterName).client
    const methodSub = method.split('.')
    switch (methodSub.length) {
        case 1:
            action = client[methodSub[0]]
            break
        case 2:
            action = client[methodSub[0]][methodSub[1]]
            break
        case 3:
            action = client[methodSub[0]][methodSub[1]][methodSub[2]]
            break
        default:
            throw new Error('[elasticsearch-call] method need to be provided')
    }

    return action(payload)
}