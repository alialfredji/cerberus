
import request from 'superagent'

import { delay } from 'src/lib/dates'
import * as hooks from '../hooks'

import countryDataModel from '../lib/data-models/country'
import { countryPriority } from '../lib/country-priority'

const workerName = 'country'

export const countryWorker = (hooksCtx) => ({
    queue: 'country',
    version: 0,
    sleep: 1000 * 60,
    delay: 5000, // to reduce status:429 errors
    handler: async (doc, { ctx, }) => {
        ctx.logger.verbose(`[${workerName}] work on ${doc.subject} - ${url}`)

        const url = [
            'https://www.instagram.com',
            `/explore/locations/${doc.subject}`,
            `?__a=1&page=${doc.payload.p}`,
        ].join('')
    
        // allow only prioritized countries to be worked on
        if (countryPriority(doc.subject) <= 0 && doc.priority <= 0) {
            return {
                action: 'reschedule',
                nextIteration: delay(1, 'month'),
                payload: doc.payload,
            }
        }
    
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
    
        // create data model
        let data = null
        try {
            data = await countryDataModel(res.body)
        } catch (err) {
            ctx.logger.error(`[${workerName}] - data model: ${err.message}`)
            throw new Error(`data model: ${err.message}, url: ${url}`)
        }
    
        // storing meaningful data
        try {
            await hooksCtx.createHook.serie(hooks.STORAGE_COUNTRY, {
                countryId: data.id,
                payload: data,
            })
        } catch (err) {
            ctx.logger.error(`[${workerName}] - storing meaningful data: ${err.message}`)
            throw new Error(`storing meaningful data: ${err.message}, url: ${url}`)
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
    },
})
