
import request from 'superagent'
import cheerio from 'cheerio'

import { delay } from 'src/lib/dates'
import * as hooks from '../hooks'

import profileDataModel from '../lib/data-models/profile'
import { profileHtmlJson } from '../lib/profile-html-json'
import { firstbloodRules } from '../lib/firstblood-rules'
import { profileDelayRules } from '../lib/profile-delay-rules'

const workerName = 'firstblood'

export const firstbloodWorker = (hooksCtx) => ({
    queue: 'first_blood',
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
                case 400:
                    ctx.logger.error(`[${workerName}] profile not found: ${doc.subject}`)
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
    
        // create data model
        let data = null
        try {
            data = await profileDataModel(json)
        } catch (err) {
            ctx.logger.error(`[${workerName}] - data model: ${err.message}`)
            throw new Error(`data model: ${err.message}, url: ${url}`)
        }
    
        // decide rules for profile
        const rules = firstbloodRules(data)
        const profileNextIteration = profileDelayRules(data, { delay })
    
        if (rules.priority !== -1) {
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
    },
})
