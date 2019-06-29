
const request = require('superagent')
const fs = require("fs")

const { delay } = require('../../shared/dates')
const dataModel = require('../../shared/instagram/directory-data-model')
const { storeJSON } = require('../../shared/aws')

const workerName = 'discovery::directory'

/* 
    ---- MAIN GOAL ----
    1. Fetch data from instagram
    2. store response json data
    -------------------
    3. create data model
    4. push country id to country queue
    5. push nextPage to directory queue
*/

const handler = async (doc, { ctx }) => {
    const url = `https://www.instagram.com/explore/locations/?__a=1&page=${doc.subject}`
    ctx.logger.verbose(`[${workerName}] work on ${doc.subject} - ${url}`)

    // ************
    // START OF MAIN GOAL
    // ************

    // Fetch data from instagram
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
            id: 'p' + doc.subject,
            vendor: 'instagram',
            type: 'directory',
            json: res.body,
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] storeJSON(directory): ${err.message}`)
        throw new Error(`storeJSON(directory): ${err.message}`)
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

    // push country id to country queue
    try {
        await ctx.doc.pushMany('country', {
            docs: data.countryList.map(country => ([country.id, 0, { p: 1 }]))
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] push(country): ${err.message}`)
        throw new Error(`push(country): ${err.message}`)
    }

    // push nextPage to directory queue
    if (data.nextPage !== null) {
        try {
            await ctx.doc.push('directory', { subject: data.nextPage })
        } catch (err) {
            ctx.logger.error(`[${workerName}] push(directory): ${err.message}`)
            throw new Error(`push(directory): ${err.message}`)
        }
    }

    return {
        action: 'reschedule',
        nextIteration: delay(10, 'year'),
    }
}

module.exports = {
    queue: 'directory',
    version: 0,
    sleep: 1000 * 60,
    handler,
}
