
const extractInstagramDataFromHtml = async (res, lib) => {
    let payload

    let dom = lib.cheerio.load(res.text)
    dom = dom('script').filter(item => item.type === 'script')
    const scriptThree = dom.prevObject['3']
    const scriptFour = dom.prevObject['4']
    dom = scriptThree

    if (!dom.children || !dom.children[0]) {
        throw new Error('Instagram profile not found')
    }

    dom = dom.children[0].data
    payload = dom.indexOf('window._sharedData') !== -1 ? dom : null

    // if above is null, try the second script
    if (payload === null) {
        dom = scriptFour

        if (!dom.children || !dom.children[0]) {
            throw new Error('Instagram profile not found')
        }

        dom = dom.children[0].data
        payload = dom.indexOf('window._sharedData') !== -1 ? dom : null

        if (payload === null) {
            throw new Error('failed to parse profile')
        }
    }

    payload = payload.replace('window._sharedData = ', '')
    payload = payload.substring(0, payload.length - 1)
    payload = JSON.parse(payload).entry_data.ProfilePage[0]

    return payload
}

module.exports = extractInstagramDataFromHtml