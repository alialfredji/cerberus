
const workerName = 'profile-builder::profile'

const storagePg = require('../../shared/storage-pg')

const { delay } = require('../../shared/dates')
const { profileBuilderDataModel } = require('./lib/profile-builder-data-model')
const { buildElsProfile } = require('./lib/build-els-profile')
const { buildCachedProfile } = require('./lib/build-cached-profile')
const { execRaw, queries: apiQueries } = require('../../shared/search-api')

const handler = async (doc, { ctx }) => {
    ctx.logger.verbose(`[${workerName}] work on ${doc.subject}`)

    let queries = null
    try {
        queries = await Promise.all([
            await storagePg.getProfile(doc.subject, { limit: 60 }),
            await storagePg.getProfilePosts(doc.subject, { limit: 60 }),
            // getProfileLang(profileId),
        ])
    } catch (err) {
        ctx.logger.error(`[${workerName}] - fetch storage data: ${err.message}`)
        throw new Error(`fetch storage data: ${err.message}`)
    }

    let dataModel = null
    try {
        dataModel = await profileBuilderDataModel({
            postData: queries[1][0],
            profileData: queries[0][0],
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] - profile builder data model: ${err.message}`)
        throw new Error(`profile builder data model: ${err.message}`)
    }

    if (dataModel === null) {
        ctx.logger.verbose(`[${workerName}] profile data not found`)
        return { action: 'drop' }
    }

    // dont update profile data if not public
    let cachedProfile = null
    let elsProfile = null
    try {
        cachedProfile = await buildCachedProfile(dataModel)
        elsProfile = await buildElsProfile(dataModel)
    } catch (err) {
        ctx.logger.error(`[${workerName}] - build profile document: ${err.message}`)
        throw new Error(`build profile document: ${err.message}`)
    }

    try {
        await execRaw(apiQueries.indexElsProfile, {
            id: doc.subject,
            body: elsProfile,
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] - index elasticsearch profile: ${err.message}`)
        throw new Error(`index elasticsearch profile: ${err.message}`)
    }

    try {
        await execRaw(apiQueries.setCachedProfile, {
            id: doc.subject,
            body: cachedProfile,
        })
    } catch (err) {
        ctx.logger.error(`[${workerName}] - set cached profile: ${err.message}`)
        throw new Error(`set cached profile: ${err.message}`)
    }

    return { action: 'drop' }
}

module.exports = {
    queue: 'profile_builder',
    version: 0,
    sleep: 1000 * 60,
    handler,
}
