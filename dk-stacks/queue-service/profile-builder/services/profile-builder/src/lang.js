
const workerName = 'profile-builder::profile'

const handler = async (doc, { ctx }) => {
    // need detect language api key or can call search-api to find out
    // if error or something bad happened set values as null
    // or maybe the language detection can be a queue for itself and save data in storage_pg
    // const lang = await findLang(dataModel)
}

module.exports = {
    queue: 'profile_lang',
    version: 0,
    sleep: 1000 * 60,
    // delay: 2000, // to reduce status:429 errors
    handler,
}
