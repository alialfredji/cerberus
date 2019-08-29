
const workerName = 'profile-builder::profile'

const storagePg = require('../../shared/storage-pg')

const { profileBuilderDataModel } = require('./lib/profile-builder-data-model')
const { buildElsProfile } = require('./lib/build-els-profile')

const handler = async (doc, { ctx }) => {
    // ctx.logger.verbose(`[${workerName}] work on ${doc.subject} - ${url}`)

    const queries = await Promise.all([
        await storagePg.getProfile(doc.subject, { limit: 60 }),
        await storagePg.getProfilePosts(doc.subject, { limit: 60 }),
        // getProfileLang(profileId),
    ])

    const dataModel = await profileBuilderDataModel({
        postData: queries[1][0],
        profileData: queries[0][0],
    })

    // need detect language api key or can call search-api to find out
    // if error or something bad happened set values as null
    // or maybe the language detection can be a queue for itself and save data in storage_pg
    // const lang = await findLang(dataModel)

    // const cachedProfile = await buildCachedProfile(dataModel)
    const elsProfile = await buildElsProfile(dataModel)
    console.log(elsProfile)

    return { action: 'complete' }
}

module.exports = {
    queue: 'profile_builder',
    version: 0,
    sleep: 1000 * 60,
    // delay: 2000, // to reduce status:429 errors
    handler,
}
