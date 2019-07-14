
const request = require('superagent')

const { delay } = require('../../shared/dates')
const dataModel = require('../../shared/instagram/post-data-model')
const storageDataModel = require('../../shared/instagram/storage-data-models/post')
const storagePg = require('../../shared/storage-pg')
// const { storeJSON } = require('../../shared/aws')

const postPushToFirstBlood = require('./lib/post-push-to-first-blood')

const workerName = 'post-tracker::post'

/* 
    ---- MAIN GOAL ----
    1. Fetch data from instagram // @TODO benchmark speed, 429 logger, 200 successfully downloaded json logger
    2. store response json data
    -------------------
    3. create data model
    4. push usernames to first-blood queue
*/

const handler = async (doc, { ctx, }) => {
    const url = `https://www.instagram.com/p/${doc.subject}?__a=1`
    ctx.logger.verbose(`[${workerName}] work on ${doc.subject} - ${url}`)

    // ************
    // START OF MAIN GOAL
    // ************

    // fetch data from instagram
    let res = null
    try {
        res = await request.get(url).timeout({ deadline: 2500 })
    } catch (err) {
        // handle connection timeout
        if (err.code === 'ABORTED') {
            ctx.logger.error(`[${workerName}] connection timeout`)

            return {
                action: 'reschedule',
                nextIteration: delay(2, 'hours'),
            }
        }

        if (err.status === 429) {
            ctx.logger.error(`[${workerName}] too many requests`)
            return {
                action: 'reschedule',
                nextIteration: delay(2, 'hours'),
            }
        }

        if (err.status === 404) {
            ctx.logger.error(`[${workerName}] - post not found (${err.message}): ${url}`)

            switch (doc.iterations) {
                case 0:
                    return {
                        action: 'reschedule',
                        nextIteration: delay(1, 'week'),
                    }
                case 1:
                    return {
                        action: 'reschedule',
                        nextIteration: delay(2, 'week'),
                    }
                case 2:
                    return {
                        action: 'reschedule',
                        nextIteration: delay(3, 'week'),
                    }
                case 3:
                    return {
                        action: 'reschedule',
                        nextIteration: delay(1, 'month'),
                    }
                case 4:
                    return {
                        action: 'reschedule',
                        nextIteration: delay(2, 'month'),
                    }
                default:
                    return { action: 'drop' }
            }
        } 

        ctx.logger.error(`[${workerName}] - http failed (${err.message}): ${url}`)
        throw new Error(`http failed: ${err.message}, url: ${url}, status: ${err.status}`)
    }

    // // store response json data
    // try {
    //     await storeJSON({
    //         id: res.body.graphql.shortcode_media.owner.id + '/' + doc.subject,
    //         vendor: 'instagram',
    //         type: 'profile-post',
    //         json: res.body,
    //     })
    // } catch (err) {
    //     ctx.logger.error(`[${workerName}] storeJSON(post): ${err.message}`)
    //     throw new Error(`storeJSON(post): ${err.message}`)
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
        throw new Error(`data model: ${err.message}, url: ${url}`)
    }

    // storing meaningful data
    try {
        const storageData = storageDataModel(data)
        await storagePg.putPost(data.ownerId, data.code, storageData)
    } catch (err) {
        ctx.logger.error(`[${workerName}] - storing meaningful data: ${err.message}`)
        throw new Error(`storing meaningful data: ${err.message}, url: ${url}`)
    }

    // push usernames to first-blood queue
    try {
        await ctx.doc.pushMany('first_blood', {
            docs: postPushToFirstBlood(data).map(item => ([item.subject]))
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] push(first_blood): ${err.message}`)
        throw new Error(`push(first_blood): ${err.message}`)
    }

    return { action: 'complete' }
}

module.exports = {
    queue: 'post_tracker',
    version: 0,
    sleep: 1000 * 60,
    // delay: 2000, // to reduce status:429 errors
    handler,
}
