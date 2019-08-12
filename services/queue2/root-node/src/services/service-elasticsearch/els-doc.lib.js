
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html

import { runQuery } from './els.lib' 

export const index = (clusterName, { index, type, id, body }) =>
    runQuery({
        method: 'index',
        clusterName,
        payload: { index, type, id, body },
    })

export const remove = (clusterName, { index, type, id }) =>
    runQuery({
        method: 'delete',
        clusterName,
        payload: { index, type, id },
    })

export const search = (clusterName, { index, type, body, q }) =>
    runQuery({
        method: 'search',
        clusterName,
        payload: {
            index,
            type,
            ...(q ? { q } : {}),
            ...(body ? { body } : {}),
        },
    })

export const exists = (clusterName, { index, type, id }) =>
    runQuery({
        method: 'exists',
        clusterName,
        payload: { index, type, id },
    })

export const get = (clusterName, { index, type, id }) =>
    runQuery({
        method: 'get',
        clusterName,
        payload: { index, type, id },
    })
