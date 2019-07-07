
let pg

const query = (q, s) =>
    pg.query(q, s, 'storage-pg')

const putCountry = async (countryId, json) => {
    const q = [
        'INSERT INTO ig_location (country_id, payload)',
        'VALUES (:countryId, :value)'
    ].join(' ')

    await query(q, {
        replacements: {
            countryId,
            value: JSON.stringify(json),
        },
    })
}

const putCity = async (cityId, json) => {
    const q = [
        'INSERT INTO ig_location (city_id, payload)',
        'VALUES (:cityId, :value)'
    ].join(' ')

    await query(q, {
        replacements: {
            cityId,
            value: JSON.stringify(json),
        },
    })
}

const putLocation = async (locationId, json) => {
    const q = [
        'INSERT INTO ig_location (location_id, payload)',
        'VALUES (:locationId, :value)'
    ].join(' ')

    await query(q, {
        replacements: {
            locationId,
            value: JSON.stringify(json),
        },
    })
}

const putPost = async (profileId, postId, json) => {
    const q = [
        'INSERT INTO ig_post (profile_id, post_id, payload)',
        'VALUES (:profileId, :postId, :value)'
    ].join(' ')

    await query(q, {
        replacements: {
            profileId,
            postId,
            value: JSON.stringify(json),
        },
    })
}

const putProfile = async (profileId, json) => {
    const q = [
        'INSERT INTO ig_profile (profile_id, payload)',
        'VALUES (:profileId, :value)'
    ].join(' ')

    await query(q, {
        replacements: {
            profileId,
            value: JSON.stringify(json),
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
