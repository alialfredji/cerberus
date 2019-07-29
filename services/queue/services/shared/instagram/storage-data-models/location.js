
/*

    const value = [
        id,
        name,
        lat,
        lng,
        countryId,
        countryName,
        cityId,
        cityName,
        locationAverageDateActivity,

        postsList, // only post codes
    ]
*/

module.exports = (data) => ([
    data.id,
    data.name,
    data.lat,
    data.lng,
    data.countryId,
    data.countryName,
    data.cityId,
    data.cityName,
    data.avgPostTimestamp,
    data.postsList.map(item => item.code),
])