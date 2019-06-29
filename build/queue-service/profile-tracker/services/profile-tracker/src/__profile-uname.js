
const winston = require('winston')
const request = require('superagent')

const { exec } = require('../../shared/lock-queue/query')
const lq = require('../../shared/lock-queue')
const els = require('../../shared/els-actions')

const postDataModel = require('../../shared/instagram/post-data-model')


/**
 * Worker Informations
 */

const workerType = 'planned'
const workerName = 'profile-uname'
const queueName = 'is_prf_uname'
const queueVersion = 0


/**
 * Worker Test Document
 */

const makeTestDocument = () => {
    winston.level = 'debug' // [ error | info | verbose | debug ]

    return {
        id: 1,
        domain: 'is_prf_uname',
        subject: '276192188',
        payload: {
            n: 1,
            // posts: [ 'BiTpwo0BgIt','BiS5MtUhD7H' ],
            // foundUname: 'beautifuldestinations',
            // postIdx: 0,
        },
    }
}


/**
 * Worker Handler
 */

// 1. get posts from db
// 2. extract post_codes
// 3. loop through posts until it get's a new username
// 4. get post data from instagram
// 5. create post data model
// 6. push new username to is_prf queue
// 7. resolve -- drop

// if all instagram post responses fails
// resolve -- reschedule


const postsLimit = 5

// eslint-disable-next-line
const handler = async (doc, resolve, reject) => {
    winston.verbose(`[${workerName}] work on ${doc.subject}`)

    // find the posts
    if (!doc.payload.posts) {
        winston.verbose(`[${workerName}] ${doc.subject} - find posts`)
        const query = [
            'select post_code from is_rel_posts',
            `where profile_id = ${doc.subject}`,
            'order by updated_at desc',
            `limit ${postsLimit * doc.payload.n};`,
        ].join(' ')

        const res = await exec(query)
        resolve({
            action: 'reschedule',
            nextIteration: lq.delay(1, 'second'),
            payload: {
                ...doc.payload,
                posts: res[0].map(i => i.post_code),
            },
        })

    // complete task with username
    } else if (doc.payload.foundUname) {
        winston.verbose(`[${workerName}] ${doc.subject} - success`)
        try {
            await lq.push.one('is_prf', doc.payload.foundUname, {
                payload: { i: doc.subject },
            })

            // update els index to now that new username is found
            await lq.push.one('els_ops', `${doc.subject}-reset-recovery-${Date.now()}`, {
                payload: els.update(
                    'instagram_v6',
                    'profiles',
                    doc.subject,
                    {
                        _recovery: null,
                        username: doc.payload.foundUname,
                    }
                ),
            })

            resolve({ action: 'drop' })
        } catch (err) {
            winston.error(`[${workerName}] ${doc.subject} - push(is_prf): ${err.message}`)
            return reject(`push(is_prf): ${err.message}`, doc.payload)
        }

    // process has failed
    } else if (doc.payload.postsCompleted) {
        winston.verbose(`[${workerName}] ${doc.subject} - failed`)
        if (doc.payload.n < 4) {
            resolve({
                action: 'reschedule',
                nextIteration: lq.delay(doc.payload.n, 'days'),
                payload: { n: doc.payload.n + 1 },
            })
        } else if (doc.payload.n < 8) {
            resolve({
                action: 'reschedule',
                nextIteration: lq.delay(doc.payload.n, 'weeks'),
                payload: { n: doc.payload.n + 1 },
            })
        } else {
            try {
                await lq.push.one('is_prf_remove', doc.subject)
            } catch (err) {} // eslint-disable-line
            resolve({ action: 'kill' })
        }

    // iterate through posts
    } else {
        winston.verbose(`[${workerName}] ${doc.subject} - iterate posts`)
        const postIdx = doc.payload.postIdx || 0
        const postCode = doc.payload.posts[postIdx]

        try {
            const url = `https://www.instagram.com/p/${postCode}?__a=1`
            const res = await request.get(url).timeout({ deadline: 2500 })
            const post = postDataModel(res.body)

            resolve({
                action: 'reschedule',
                nextIteration: lq.delay(1, 'second'),
                payload: {
                    ...doc.payload,
                    foundUname: post.ownerUsername,
                },
            })
        } catch (err) {
            const nextPostIdx = postIdx + 1
            if (nextPostIdx >= doc.payload.posts.length) {
                resolve({
                    action: 'reschedule',
                    nextIteration: lq.delay(1, 'second'),
                    payload: {
                        ...doc.payload,
                        postsCompleted: true,
                    },
                })
            } else {
                resolve({
                    action: 'reschedule',
                    nextIteration: lq.delay(1, 'second'),
                    payload: {
                        ...doc.payload,
                        postIdx: nextPostIdx,
                    },
                })
            }
        }
    }
}

module.exports = {
    type: workerType,
    name: workerName,

    // information used to retreive the next document to work on
    queueName,
    queueVersion,

    // handle all the documents one by one
    handler,

    // test document for dry run
    test: makeTestDocument,
}
