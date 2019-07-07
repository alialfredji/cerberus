
/*
This library takes the json response from a call like:
http://www.instagram.com/explore/locations/SE/?__a=1

And created a data model like:

{
  id: 'se',
  name: 'sweden',
  nextPage: 2,
  citiesList: [
    { cityId: c2148930, cityName: 'stockholm'},
    { cityId: c21430, cityName: 'malmö' },
    {...cities}
}

*/

const getErrorOrigin = require('./lib/get-error-origin')

class CountryDataModelError extends Error {
    constructor (message) {
        super()
        Error.captureStackTrace(this)
        this.name = 'CountryDataModelError'
        this.message = message
        this.origin = getErrorOrigin(this.stack)
    }
}

// city id
const getCityDataModelId = (city) => {
    if (!city.id || city.id === undefined) {
        throw Error('[City Id] missing in json')
    }

    return city.id.toLowerCase()
}

// city name
const getCityDataModelName = (city) => {
    if (!city.name || city.name === undefined) {
        throw Error('[City Id] missing in json')
    }

    return city.name.toLowerCase()
}

// city data model
const getCityDataModel = (city) => {
    if (!city || city === undefined) {
        throw Error('[City in Cities] is missing')
    }

    return {
        cityId: getCityDataModelId(city),
        cityName: getCityDataModelName(city),
    }
}

// get city ids
const getCountryDataModelCityList = (cities) => {
    if (cities === undefined || cities.length === 0) {
        throw Error('[Cities] missing in json')
    }

    return cities.map(getCityDataModel)
}

// nextPage
const getCountryDataModelNextPage = (hasNextPage) => {
    if (hasNextPage === null) {
        return 1
    }

    return hasNextPage
}

// id
const getCountryDataModelId = (country) => {
    if (!country.id || country.id === undefined) {
        throw Error('[Country Id] missing in json')
    }

    return country.id.toLowerCase()
}

// name
const getCountryDataModelName = (country) => {
    if (!country.name || country.name === undefined) {
        throw Error('[Country Name] missing in json')
    }

    return country.name.toLowerCase()
}

// data model
const countryDataModel = (json) => {
    const {
        country_info: country,
        city_list: cities,
        next_page: nextPage,
    } = json

    if (!country || country === undefined) {
        throw Error('[Country] missing in json')
    }

    try {
        return {
            id: getCountryDataModelId(country),
            name: getCountryDataModelName(country),
            citiesList: getCountryDataModelCityList(cities),
            nextPage: getCountryDataModelNextPage(nextPage),
        }
    } catch (err) {
        throw new CountryDataModelError(err.message)
    }
}

module.exports = countryDataModel
