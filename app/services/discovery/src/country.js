
const request = require('superagent')

const { delay } = require('../../shared/dates')
const dataModel = require('../../shared/instagram/country-data-model')
const { storeJSON } = require('../../shared/aws')

const countryPriority = require('./lib/country-priority')

const workerName = 'discovery::country'

/* 
    RULE: allow only prioritized countries to be worked on

    ---- MAIN GOAL ----
    1. Fetch data from instagram
    2. store response json data
    -------------------
    3. create data model
    4. push city id to city queue
*/

const handler = async (doc, { ctx, }) => {
    const url = `https://www.instagram.com/explore/locations/${doc.subject}?__a=1&page=${doc.payload.p}`
    ctx.logger.verbose(`[${workerName}] work on ${doc.subject} - ${url}`)

    // allow only prioritized countries to be worked on
    if (countryPriority(doc.subject) <= 0 && doc.priority <= 0) {
        return {
            action: 'reschedule',
            nextIteration: delay(1, 'month'),
            payload: doc.payload,
        }
    }

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
                payload: doc.payload,
            }
        }

        ctx.logger.error(`[${workerName}] - http failed (${err.message}): ${url}`)
        throw new Error(`http failed: ${err.message}, url: ${url}, status: ${err.status}`)
    }

    // store response json data
    try {
        await storeJSON({
            id: doc.subject + '/' + 'p' + doc.payload.p,
            vendor: 'instagram',
            type: 'country',
            json: res.body,
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] storeJSON(country): ${err.message}`)
        throw new Error(`storeJSON(country): ${err.message}`)
    }

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

    // push city id to city queue
    try {
        await ctx.doc.pushMany('city', {
            docs: data.citiesList.map(item => ([item.cityId, 0, { p: 1 }]))
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] push(city): ${err.message}`)
        throw new Error(`push(city): ${err.message}`)
    }

    return {
        action: 'reschedule',
        nextIteration: data.nextPage !== 1 ? delay(0, 'seconds') : delay(1, 'year'),
        payload: {
            ...doc.payload,
            p: data.nextPage,
        },
    }
}

module.exports = {
    queue: 'country',
    version: 0,
    sleep: 1000 * 60,
    delay: 5000, // to reduce status:429 errors
    handler,
}
