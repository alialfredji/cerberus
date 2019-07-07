
const request = require('superagent')

const { delay } = require('../../shared/dates')
const dataModel = require('../../shared/instagram/location-data-model')
const storageDataModel = require('../../shared/instagram/storage-data-models/location')
const storagePg = require('../../shared/storage-pg')
// const { storeJSON } = require('../../shared/aws')

const workerName = 'discovery::location'

/*
    ---- MAIN GOAL ----
    1. Fetch data from instagram // @TODO benchmark speed, 429 logger, 200 successfully downloaded json logger
    2. store response json data
    -------------------
    3. create data model
    4. push post code to post queue // push only posts above 200 likes
*/

const handler = async (doc, { ctx, }) => {
    const url = `https://www.instagram.com/explore/locations/${doc.subject}?__a=1`
    ctx.logger.verbose(`[${workerName}] work on ${doc.subject} - ${url}`)

    // ************
    // START OF MAIN GOAL
    // ************

    // Fetch data from instagram
    let res = null
    try {
        res = await request.get(url).timeout({ deadline: 2500 })
    } catch (err) {
        switch(err.status) {
            case 404:
            case 400:
                ctx.logger.verbose(`[${workerName}] drop document: ${doc.subject}`)
                return { action: 'drop' }
            case 429:
                ctx.logger.error(`[${workerName}] too many requests`)
                return {
                    action: 'reschedule',
                    nextIteration: delay(2, 'hours'),
                    payload: doc.payload,
                }
        }

        // handle connection timeout
        if (err.code === 'ABORTED') {
            ctx.logger.error(`[${workerName}] connection timeout`)

            return {
                action: 'reschedule',
                nextIteration: delay(2, 'hours'),
                payload: doc.payload,
            }
        }

        ctx.logger.error(`[${workerName}] - http failed (${err.message}): ${url}`)
        throw new Error(`http failed: ${err.message}, url: ${url}, status: ${err.status}`)
    }

    // // store response json data
    // try {
    //     await storeJSON({
    //         id: doc.subject,
    //         vendor: 'instagram',
    //         type: 'location',
    //         json: res.body,
    //     })
    // } catch (err) {
    //     ctx.logger.error(`[${workerName}] storeJSON(location): ${err.message}`)
    //     throw new Error(`storeJSON(location): ${err.message}`)
    // }

    // ************
    // END OF MAIN GOAL
    // ************


    // create data model
    let data = null
    try {
        data = await dataModel(res.body)
    } catch (err) {
        ctx.logger.error(`[${workerName}] - data model: ${err.message}`)
        
        switch(err.message) {
            case 'posts':
                return doc.iterations < 3
                    ? {
                        action: 'reschedule',
                        nextIteration: delay(1, 'month'),
                    }
                    : { action: 'drop' }
            case 'directory':
                return { action: 'drop' }
            default:
                throw new Error(`data model: ${err.message}, url: ${url}`)
        }
    }

    // storing meaningful data
    try {
        const storageData = storageDataModel(data)
        await storagePg.putLocation(data.id, storageData)
    } catch (err) {
        ctx.logger.error(`[${workerName}] - storing meaningful data: ${err.message}`)
        throw new Error(`storing meaningful data: ${err.message}, url: ${url}`)
    }

    // push post code to post queue
    try {
        await ctx.doc.pushMany('post', {
            docs: data.postsList
                .filter(post => post.likes >= 200) // push only posts above 200 likes
                .map(post => ([post.code]))
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] push(post): ${err.message}`)
        throw new Error(`push(post): ${err.message}`)
    }

    const elapsedTime = new Date() - data.avgPostTimestamp
    return {
        action: 'reschedule',
        nextIteration: elapsedTime < 3600000 ? delay(1, 'hours') : delay(elapsedTime),
        payload: doc.payload,
    }
}

module.exports = {
    queue: 'location',
    version: 0,
    sleep: 1000 * 60,
    delay: 2000, // to reduce status:429 errors
    handler,
}
