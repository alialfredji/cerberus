
const request = require('superagent')
const cheerio = require('cheerio')

const { delay } = require('../../shared/dates')
const dataModel = require('../../shared/instagram/profile-data-model')
const storageDataModel = require('../../shared/instagram/storage-data-models/profile')
const storagePg = require('../../shared/storage-pg')
// const { storeJSON, storeProfileIds } = require('../../shared/aws')

const extractInstagramDataFromHtml = require('./lib/extract-ig-data-from-html')
const profileNextIterationRules = require('./lib/profile-nextIteration-rules')

const workerName = 'profile-tracker::profile'

/*
    ---- MAIN GOAL ----
    1. Fetch data from instagram // @TODO benchmark speed, 429 logger, 200 logger
    2. handle if profile id is not the same, try to find new username and drop document
    3. store response json data
    -------------------
    4. create data model
    5. handle if profile turns private
    6. push posts to post_tracker queue
*/

const handler = async (doc, { ctx, }) => {
    const url = `https://www.instagram.com/${doc.subject}`
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
                ctx.logger.error(`[${workerName}] profile not found: ${doc.subject}`)

                // let a buffer of attempts to handle temporary failure or distributed cache
                const attempts = doc.payload.a404 || 0
                if (attempts < 5) {
                    return {
                        action: 'reschedule',
                        nextIteration: delay(1, 'hours'),
                        payload: {
                            ...doc.payload,
                            a404: attempts + 1,
                        },
                    }
                }

                // push the document to the username restore queue and drop the document
                try {
                    ctx.logger.verbose(`[${workerName}] drop document: ${doc.subject}`)
                    await ctx.doc.push('lost_profile', {
                        subject: doc.payload.i,
                        payload: { u: doc.subject },
                    })
                } catch (error) {
                    ctx.logger.error(`[${workerName}] push(lost_profile): ${err.message}`)
                    throw new Error(`push(lost_profile): ${err.message}`)
                }

                return { action: 'drop' }
            case 429:
                ctx.logger.error(`[${workerName}] too many requests`)

                // pause working on profile to reduce 429
                await new Promise((resolve, reject) => setTimeout(resolve, 10000))

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

    let json = null
    try {
        json = await extractInstagramDataFromHtml(res, { cheerio })
    } catch (err) {
        ctx.logger.error(`[${workerName}] - extract json from html (${err.message}): ${url}`)
        throw new Error(`extract json from html: ${err.message}, url: ${url}`)
    }

    if (!json) {
        ctx.logger.error(`[${workerName}] - Instagram profile not found: ${url}`)
        throw new Error(`[${workerName}] - Instagram profile not found: ${url}`)
    }

    // if profile id is not the same, try to find new username
    if (String(json.graphql.user.id) !== String(doc.payload.i)) {
        ctx.logger.verbose(`[${workerName}] drop document (${doc.subject}): profile id is not the same ${json.graphql.user.id} - ${doc.payload.i}`)

        try {
            await ctx.doc.push('lost_profile', {
                subject: doc.payload.i,
                payload: {},
            })
        } catch (error) {
            ctx.logger.error(`[${workerName}] push(lost_profile): ${err.message}`)
            throw new Error(`push(lost_profile): ${err.message}`)
        }

        return { action: 'drop' }
    }

    // // store response json data
    // try {
    //     await Promise.all([
    //         storeJSON({
    //             id: json.graphql.user.id + '/' + doc.subject,
    //             vendor: 'instagram',
    //             type: 'profile',
    //             json: json,
    //         }),
    //         storeProfileIds({
    //             id: json.graphql.user.id,
    //             vendor: 'instagram',
    //             type: 'profile-ids',
    //             json: {
    //                 id: json.graphql.user.id,
    //                 uname: json.graphql.user.username,
    //                 followers: json.graphql.user.edge_followed_by
    //                     ? json.graphql.user.edge_followed_by.count
    //                     : null,
    //                 date: new Date(),
    //             },
    //         })
    //     ])
    // } catch (err) {
    //     ctx.logger.error(`[${workerName}] storeJSON(profile): ${err.message}`)
    //     throw new Error(`storeJSON(profile): ${err.message}`)
    // }

    // // ************
    // // END OF MAIN GOAL
    // // ************

    // create data model
    let data = null
    try {
        data = await dataModel(json)
    } catch (err) {
        ctx.logger.error(`[${workerName}] - data model: ${err.message}`)
        throw new Error(`data model: ${err.message}, url: ${url}`)
    }

    // storing meaningful data
    try {
        const storageData = storageDataModel(data)
        await storagePg.putProfile(data.id, storageData)
    } catch (err) {
        ctx.logger.error(`[${workerName}] - storing meaningful data: ${err.message}`)
        throw new Error(`storing meaningful data: ${err.message}, url: ${url}`)
    }

    // if profile turns private
    if (data.isPublic === false) {
        ctx.logger.verbose(`[${workerName}] profile has turned PRIVATE`)

        return {
            action: 'reschedule',
            nextIteration: delay(2, 'week'),
            payload: doc.payload,
        }
    }

    // push posts to post_tracker queue
    try {
        await ctx.doc.pushMany('post_tracker', {
            docs: data.postsList.map(post => ([post.code]))
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] push(post_tracker): ${err.message}`)
        throw new Error(`push(post_tracker): ${err.message}`)
    }

    return {
        action: 'reschedule',
        nextIteration: profileNextIterationRules(data),
        payload: doc.payload,
    } 
}

module.exports = {
    queue: 'profile_tracker',
    version: 0,
    sleep: 1000 * 60,
    handler,
}
