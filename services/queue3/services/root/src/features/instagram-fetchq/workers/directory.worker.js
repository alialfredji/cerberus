
import request from 'superagent'
import { delay } from 'src/lib/dates'
import directoryDataModel from '../lib/data-models/directory'

const workerName = 'directory'

export const directoryWorker = (hooksCtx) => ({
    queue: 'directory',
    version: 0,
    sleep: 1000 * 60,
    handler: async (doc, { ctx }) => {
        ctx.logger.verbose(`[${workerName}] work on ${doc.subject} - ${url}`)
        
        const url = [
            'https://www.instagram.com',
            '/explore/locations',
            `/?__a=1&page=${doc.subject}`
        ].join('')

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
    
        // create data model
        let data = null
        try {
            data = await directoryDataModel(res.body)
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
    },
})
