
/*

    const value = [
        id,
        name,
        currentPage,

        citiesList, // only city ids
    ]
*/

module.exports = (data) => ([
    data.id,
    data.name,
    data.currentPage,
    data.citiesList.map(item => item.cityId),
])
