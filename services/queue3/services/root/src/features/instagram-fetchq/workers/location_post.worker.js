
import request from 'superagent'
import { delay } from 'src/lib/dates'

import postDataModel from '../lib/data-models/post'
import { postToFirstblood } from '../lib/post-to-firstblood'

const workerName = 'location-post'

export const locationPostWorker = (hooksCtx) => ({
    queue: 'post',
    version: 0,
    sleep: 1000 * 60,
    // delay: 2000, // to reduce status:429 errors
    handler: async (doc, { ctx, }) => {
        ctx.logger.verbose(`[${workerName}] work on ${doc.subject} - ${url}`)
        
        const url = [
            'https://www.instagram.com',
            `/p/${doc.subject}?__a=1`,
        ].join('')

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
    
        // create data model
        let data = null
        try {
            data = await postDataModel(res.body)
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
                docs: postToFirstblood(data).map(item => ([item.subject]))
            })
        } catch (err) {
            ctx.logger.error(`[${workerName}] push(first_blood): ${err.message}`)
            throw new Error(`push(first_blood): ${err.message}`)
        }
    
        return {
            action: 'complete',
        }
    },
})

