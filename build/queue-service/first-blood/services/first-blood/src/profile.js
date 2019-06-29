
const request = require('superagent')
const cheerio = require('cheerio')

const { delay } = require('../../shared/dates')
const dataModel = require('../../shared/instagram/profile-data-model')
const { storeJSON } = require('../../shared/aws')

const extractInstagramDataFromHtml = require('./lib/extract-ig-data-from-html')
const getFirstBloodProfileRules = require('./lib/get-first-blood-profile-rules')
const profileNextIterationRules = require('./lib/profile-nextIteration-rules')

const workerName = 'first-blood::profile'

/*
    ---- MAIN GOAL ----
    1. Fetch data from instagram // @TODO benchmark speed, 429 logger, 200 successfully downloaded json logger
    2. store response json data
    -------------------
    3. create data model
    4. decide rules for profile // @TODO: consider using isVerified and isBusinessAccount for validation
    5. push username to profile_tracker queue
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
            case 400:
                ctx.logger.error(`[${workerName}] profile not found: ${doc.subject}`)
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

    // store response json data
    try {
        await storeJSON({
            id: json.graphql.user.id + '/' + doc.subject,
            vendor: 'instagram',
            type: 'first-blood',
            json: json,
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] storeJSON(profile): ${err.message}`)
        throw new Error(`storeJSON(profile): ${err.message}`)
    }

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

    // decide rules for profile
    const rules = getFirstBloodProfileRules(data)
    const profileNextIteration = profileNextIterationRules(data)

    // store response json in profile list if influencerr
    if (rules.priority !== 1) {
        try {
            await storeJSON({
                id: json.graphql.user.id + '/' + doc.subject,
                vendor: 'instagram',
                type: 'profile',
                json: json,
            })
        } catch (err) {
            ctx.logger.error(`[${workerName}] storeJSON(profile): ${err.message}`)
            throw new Error(`storeJSON(profile): ${err.message}`)
        }
    }

    // push username to profile_tracker queue
    if (rules.priority !== -1) {
        try {
            ctx.logger.verbose(`[${workerName}] new influencer: ${doc.subject}`)
            await ctx.doc.push('profile_tracker', {
                subject: data.username,
                payload: { i: data.id },
                nextIteration: profileNextIteration,
            })
        } catch (err) {
            ctx.logger.error(`[${workerName}] push(profile_tracker): ${err.message}`)
            throw new Error(`push(profile_tracker): ${err.message}`)
        }
    } else {
        ctx.logger.verbose([
            `[profile] ${data.username} NOT qualified -`,
            `Reason: ${rules.reason.type} = ${rules.reason.value}`,
        ].join(' '))
    }

    // push posts to post_tracker queue
    if (rules.priority !== -1) {
        try {
            await ctx.doc.pushMany('post_tracker', {
                docs: data.postsList.map(post => ([post.code]))
            })
        } catch (err) {
            ctx.logger.error(`[${workerName}] push(post_tracker): ${err.message}`)
            throw new Error(`push(post_tracker): ${err.message}`)
        }
    }

    return rules.priority === 0
        ? { action: 'complete' }
        : {
            action: 'reschedule',
            nextIteration: delay(rules.monthsCount, 'months'),
            payload: doc.payload,
        }
}

module.exports = {
    queue: 'first_blood',
    version: 0,
    sleep: 1000 * 60,
    handler,
}
