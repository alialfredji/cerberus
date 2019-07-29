
/*

    const value = [
        id,
        name,
        countryId,
        countryName,
        nextPage,

        locationsList, // only location id
    ]
*/

module.exports = (data) => ([
    data.id,
    data.name,
    data.countryId,
    data.countryName,
    data.nextPage,
    data.locationsList.map(item => item.locationId)
])