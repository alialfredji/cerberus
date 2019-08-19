
import { runQuery } from './els.lib' 

export const exists = (clusterName, { index }) =>
    runQuery({
        method: 'indices.exists',
        clusterName,
        payload: { index },
    })

export const create = (clusterName, { index }) =>
    runQuery({
        method: 'indices.create',
        clusterName,
        payload: { index },
    })

export const get = (clusterName, { index }) =>
    runQuery({
        method: 'indices.get',
        clusterName,
        payload: { index },
    })

export const open = (clusterName, { index }) =>
    runQuery({
        method: 'indices.open',
        clusterName,
        payload: { index },
    })

export const close = (clusterName, { index }) =>
    runQuery({
        method: 'indices.close',
        clusterName,
        payload: { index },
    })

export const remove = (clusterName, { index }) =>
    runQuery({
        method: 'indices.delete',
        clusterName,
        payload: { index },
    })

export const stats = (clusterName, { index }) =>
    runQuery({
        method: 'indices.stats',
        clusterName,
        payload: { index },
    })

export const putMapping = (clusterName, { index, type, body }) =>
    runQuery({
        method: 'indices.putMapping',
        clusterName,
        payload: { index, type, body },
    })

export const getMapping = (clusterName, { index, type }) =>
    runQuery({
        method: 'indices.getMapping',
        clusterName,
        payload: { index, type },
    })

export const getFieldMapping = (clusterName, { index, type, fields }) =>
    runQuery({
        method: 'indices.getFieldMapping',
        clusterName,
        payload: { index, type, fields },
    })

export const putSettings = (clusterName, { index, body }) =>
    runQuery({
        method: 'indices.putSettings',
        clusterName,
        payload: { index, body },
    })

export const getSettings = (clusterName, { index, type }) =>
    runQuery({
        method: 'indices.getSettings',
        clusterName,
        payload: { index, type },
    })

export const reindex = (clusterName, { source = {}, dest = {}, max_docs }) =>
    runQuery({
        method: 'reindex',
        clusterName,
        payload: {
            body: { source, dest },
            ...(max_docs ? { max_docs } : {}),
        },
    })