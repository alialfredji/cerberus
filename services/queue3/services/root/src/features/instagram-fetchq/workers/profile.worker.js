
import request from 'superagent'
import cheerio from 'cheerio'

import { delay } from 'src/lib/dates'
import * as hooks from '../hooks'

import profileDataModel from '../lib/data-models/profile'
import { profileHtmlJson } from '../lib/profile-html-json'
import { profileDelayRules } from '../lib/profile-delay-rules'

const workerName = 'profile'

export const profileWorker = (hooksCtx) => ({
    queue: 'profile_tracker',
    version: 0,
    sleep: 1000 * 60,
    handler: async (doc, { ctx, }) => {
        ctx.logger.verbose(`[${workerName}] work on ${doc.subject} - ${url}`)
        
        const url = [
            'https://www.instagram.com',
            `/${doc.subject}`,
        ].join('')

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
            json = await profileHtmlJson(res, { cheerio })
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
    
        // create data model
        let data = null
        try {
            data = await profileDataModel(json)
        } catch (err) {
            ctx.logger.error(`[${workerName}] - data model: ${err.message}`)
            throw new Error(`data model: ${err.message}, url: ${url}`)
        }
    
        // storing meaningful data
        try {
            await hooksCtx.createHook.serie(hooks.STORAGE_PROFILE, {
                profileId: data.id,
                payload: data,
            })
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
            nextIteration: profileDelayRules(data, { delay }),
            payload: doc.payload,
        } 
    },
})
