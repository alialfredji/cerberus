/*
This library takes the json response from a call like:
http://www.instagram.com/explore/locations/c2148930/?__a=1

And create a data model like:

{
  "id": "c2148930",
  "name": "nordstaden",
  "countryId": "SE",
  "countryName": "sweden",
  "locationsList": [
    {
      "locationId": "218676665",
      "locationName": "gothenburg"
    },
    {
      "locationId": "1432868",
      "locationName": "clarion hotel post"
    },
    ....
  ],
  "nextPage": 2
}

*/

const getErrorOrigin = require('./lib/get-error-origin')

class CityDataModelError extends Error {
    constructor (message) {
        super()
        Error.captureStackTrace(this)
        this.name = 'CityDataModelError'
        this.message = message
        this.origin = getErrorOrigin(this.stack)
    }
}

// location name
const getLocationDataModelName = (location) => {
    if (location.name === undefined) {
        throw Error('[Location Name] missing in json')
    }

    return location.name.toLowerCase()
}

// location id
const getLocationDataModelId = (location) => {
    if (!location.id || location.id === undefined) {
        throw Error('[Location Id] missing in json')
    }

    return location.id
}

// location model
const getLocationDataModel = (location) => {
    if (!location || location === undefined) {
        throw Error('[Location in Locations] missing in json')
    }

    return {
        locationId: getLocationDataModelId(location),
        locationName: getLocationDataModelName(location),
    }
}

// get location ids
const getCityDataModelLocationsList = (locations) => {
    if (locations === undefined || locations.length === 0) {
        throw Error('[Locations] missing in json')
    }

    // collect unique location ids while deduplicating
    const idsAcc = []

    return locations
        .map(getLocationDataModel)
        .filter((item) => {
            if (idsAcc.indexOf(item.locationId) !== -1) {
                return false
            }
            idsAcc.push(item.locationId)
            return true
        })
}

// nextPage
const getCityDataModelNextPage = (hasNextPage) => {
    if (hasNextPage === null) {
        return 1
    }

    return hasNextPage
}

// country name
const getCityDataModelCountryName = (country) => {
    if (!country.name || country.name === undefined) {
        throw Error('[Country Name] missing in json')
    }

    return country.name.toLowerCase()
}

// country id
const getCityDataModelCountryId = (country) => {
    if (!country.id || country.id === undefined) {
        throw Error('[Country Id] missing in json')
    }

    return country.id.toLowerCase()
}

// id
const getCityDataModelId = (city) => {
    if (!city.id || city.id === undefined) {
        throw Error('[City Id] missing in json')
    }

    return city.id
}

// name
const getCityDataModelName = (city) => {
    if (!city.name || city.name === undefined) {
        throw Error('[City Name] missing in json')
    }

    return city.name.toLowerCase()
}

// data model
const cityDataModel = (json) => {
    const {
        country_info: country,
        city_info: city,
        location_list: locations,
        next_page: nextPage,
    } = json

    if (!country || country === undefined) {
        throw Error('[Country] missing in json')
    }

    if (!city || city === undefined) {
        throw Error('[City] missing in json')
    }

    try {
        return {
            id: getCityDataModelId(city),
            name: getCityDataModelName(city),
            countryId: getCityDataModelCountryId(country),
            countryName: getCityDataModelCountryName(country),
            locationsList: getCityDataModelLocationsList(locations),
            nextPage: getCityDataModelNextPage(nextPage),
        }
    } catch (err) {
        throw new CityDataModelError(err.message)
    }
}

module.exports = cityDataModel
