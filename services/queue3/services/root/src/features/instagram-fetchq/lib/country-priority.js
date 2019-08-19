
export const countryPriority = (countryId) => {
    const countryList = [
        'de', // Germany
        'se', // Sweden
        'dk', // Denmark
        'no', // Norway
        'fi', // Finland
        'pl', // Poland
    ]

    return countryList.indexOf(countryId) !== -1
        ? 200
        : 0
}
