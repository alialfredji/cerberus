
let pg

const query = (q, s) =>
    pg.query(q, s, 'storage-pg')

const putCountry = async (countryId, json) => {
    const q = [
        'INSERT INTO ig_country (country_id, payload)',
        'VALUES (:countryId, :payload)'
    ].join(' ')

    await query(q, {
        replacements: {
            countryId,
            payload: JSON.stringify(json),
        },
    })
}

const putCity = async (cityId, json) => {
    const q = [
        'INSERT INTO ig_city (city_id, payload)',
        'VALUES (:cityId, :payload)'
    ].join(' ')

    await query(q, {
        replacements: {
            cityId,
            payload: JSON.stringify(json),
        },
    })
}

const putLocation = async (locationId, json) => {
    const q = [
        'INSERT INTO ig_location (location_id, payload)',
        'VALUES (:locationId, :payload)'
    ].join(' ')

    await query(q, {
        replacements: {
            locationId,
            payload: JSON.stringify(json),
        },
    })
}

const putPost = async (profileId, postId, json) => {
    const q = [
        'INSERT INTO ig_post (profile_id, post_id, payload)',
        'VALUES (:profileId, :postId, :payload)'
    ].join(' ')

    await query(q, {
        replacements: {
            profileId,
            postId,
            payload: JSON.stringify(json),
        },
    })
}

const putProfile = async (profileId, json) => {
    const q = [
        'INSERT INTO ig_profile (profile_id, payload)',
        'VALUES (:profileId, :payload)'
    ].join(' ')

    await query(q, {
        replacements: {
            profileId,
            payload: JSON.stringify(json),
        },
    })
}

const register = ({ registerAction, settings }) => {
    const { hooksLib, pgLib } = settings
    const { SERVICE, INIT_SERVICES } = hooksLib

    registerAction({
        hook: INIT_SERVICES,
        name: `${SERVICE} storage-pg`,
        trace: __filename,
        handler: () => {
            pg = pgLib
        },
    })
}

module.exports = {
    register,

    // storage to pg
    putCity,
    putCountry,
    putLocation,
    putPost,
    putProfile,
}
