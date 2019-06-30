

/*
This library takes the json response from a call like:
http://www.instagram.com/explore/locations/?__a=1

And created a data model like:

{
  nextPage: 2,
  countryList: [
    { id: 'se', name: 'sweden'},
    { id: 'dk', name: 'denmark' },
    {...countries}
}

*/

const getErrorOrigin = require('../get-error-origin')

class DirectoryDataModelError extends Error {
    constructor (message) {
        super()
        Error.captureStackTrace(this)
        this.name = 'DirectoryDataModelError'
        this.message = message
        this.origin = getErrorOrigin(this.stack)
    }
}

const countryDataModel = country => ({
    id: country.id.toLowerCase(),
    name: country.name.toLowerCase(),
})

// data model
const directoryDataModel = (json) => {
    if (json.country_list === undefined) {
        throw Error('[countryList] missing in json')
    }

    try {
        return {
            countryList: json.country_list.map(countryDataModel),
            nextPage: json.next_page,
        }
    } catch (err) {
        throw new DirectoryDataModelError(err.message)
    }
}

module.exports = directoryDataModel
