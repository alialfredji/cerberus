
const request = require('superagent')

const { delay } = require('../../shared/dates')
const dataModel = require('../../shared/instagram/post-data-model')
const { storeJSON } = require('../../shared/aws')

const postPushToFirstBlood = require('./lib/post-push-to-first-blood')

const workerName = 'discovery::post'

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
    //         type: 'post',
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

    // push usernames to first-blood queue
    try {
        await ctx.doc.upsert('first_blood', {
            subject: data.ownerUsername,
            priority: data.likesCount > 200 ? data.likesCount : 200,
        })

        await ctx.doc.pushMany('first_blood', {
            docs: postPushToFirstBlood(data).map(item => ([item.subject]))
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] push(first_blood): ${err.message}`)
        throw new Error(`push(first_blood): ${err.message}`)
    }

    return {
        action: 'complete',
    }
}

module.exports = {
    queue: 'post',
    version: 0,
    sleep: 1000 * 60,
    // delay: 2000, // to reduce status:429 errors
    handler,
}
