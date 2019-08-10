
import request from 'superagent'
import { delay } from 'src/lib/dates'
import * as hooks from '../hooks'

import postDataModel from '../lib/data-models/post'
import { postToFirstblood } from '../lib/post-to-firstblood'

const workerName = 'profile-post'

export const profilePostWorker = (hooksCtx) => ({
    queue: 'post_tracker',
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
    
        // create data model
        let data = null
        try {
            data = await postDataModel(res.body)
        } catch (err) {
            ctx.logger.error(`[${workerName}] - data model: ${err.message}`)
            throw new Error(`data model: ${err.message}, url: ${url}`)
        }

        // storing meaningful data
        try {
            await hooksCtx.createHook.serie(hooks.STORAGE_POST, {
                profileId: data.ownerId,
                postId: data.code,
                payload: data,
            })
        } catch (err) {
            ctx.logger.error(`[${workerName}] - storing meaningful data: ${err.message}`)
            throw new Error(`storing meaningful data: ${err.message}, url: ${url}`)
        }
    
        // push usernames to first-blood queue
        try {
            await ctx.doc.pushMany('first_blood', {
                docs: postToFirstblood(data).map(item => ([item.subject]))
            })
        } catch (err) {
            ctx.logger.error(`[${workerName}] push(first_blood): ${err.message}`)
            throw new Error(`push(first_blood): ${err.message}`)
        }
    
        return { action: 'complete' }
    },
})
