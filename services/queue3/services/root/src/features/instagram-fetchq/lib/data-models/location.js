
/*
This library takes the json response from a call like:
http://www.instagram.com/explore/locations/242002246/?__a=1

And created a data model like:

{
  id: '242002246',
  name: 'östersund centrum',
  lat: '63.1749555676'
  lng: '14.6390267912',
  countryId: 'se',
  countryName: 'sweden',
  cityId: 'c2149831',
  cityName: 'odenslund',
  avgPostTimestamp: 123456789012,
  postsList: [
   {
       id: '111112323423423',
       ownerId: '39957005',
       code: 'BAbTRER32',
       timestamp: 1503266944,
       likes: 233,
       videoViews: null,
       postType: 0,
       comments: 2,
   },
   {
       id: '121223333445455'
       ownerId: '39953305',
       code: 'SENORkh2BbY',
       timestamp: 1503266944,
       likes: 233,
       videoViews: 3222,
       postType: 1,
       comments: 10,
   },
   { ...post}
  ]
}

*/

const getErrorOrigin = require('./lib/get-error-origin')
const getAvgPostTimestamp = require('./lib/get-average-post-timestamp')
const getPostTimestampByDate = require('./lib/get-post-timestamp-by-date')

class LocationDataModelError extends Error {
    constructor (message) {
        super()
        Error.captureStackTrace(this)
        this.name = 'LocationDataModelError'
        this.message = message
        this.origin = getErrorOrigin(this.stack)
    }
}

// post check if video
const getPostDataModelIsVideo = (post) => {
    const isVideo = post.is_video

    if (isVideo === undefined) {
        throw Error('[Post isVideo] missing in json')
    }

    return isVideo === true
}

// post video views
const getPostDataModelVideoViews = (post) => {
    const isVideo = getPostDataModelIsVideo(post)

    if (!isVideo) {
        return null
    }

    if (post.video_view_count === undefined) {
        throw Error('[Post videoViews] missing in json')
    }

    return post.video_view_count
}

// post type
const getPostDataModelPostType = (post) => {
    const isVideo = getPostDataModelIsVideo(post)

    if (isVideo) {
        return 1
    }

    return 0
}

// post comments
const getPostDataModelComments = (post) => {
    if (post.edge_media_to_comment === undefined) {
        throw Error('[Post Comments] missing in json')
    }

    if (post.edge_media_to_comment.count === undefined) {
        throw Error('[Post Comments Count] missing in json')
    }

    return post.edge_media_to_comment.count
}

// post likes
const getPostDataModelLikes = (post) => {
    if (post.edge_liked_by === undefined) {
        throw Error('[Post Likes] missing in json')
    }

    if (post.edge_liked_by.count === undefined) {
        throw Error('[Post Likes Count] missing in json')
    }

    return post.edge_liked_by.count
}

// post timestamp
const getPostDataModelTimestamp = (post) => {
    if (!post.taken_at_timestamp || post.taken_at_timestamp === undefined) {
        throw Error('[Post Timestamp] missing in json')
    }

    return getPostTimestampByDate(post.taken_at_timestamp)
}

// post code
const getPostDataModelCode = (post) => {
    if (!post.shortcode || post.shortcode === undefined) {
        throw Error('[Post Code] missing in json')
    }

    return post.shortcode
}

// post owner id
const getPostDataModelOwnerId = (post) => {
    if (!post.owner || post.owner === undefined) {
        throw Error('[Post Owner] missing in json')
    }

    if (!post.owner.id || post.owner.id === undefined) {
        throw Error('[Post Owner Id] missing in json')
    }

    return post.owner.id
}

// post id
const getPostDataModelId = (post) => {
    if (!post.id || post.id === undefined) {
        throw Error('[Post Id] missing in json')
    }

    return post.id
}

// post
const getPostDataModel = (post) => {
    const postData = post.node

    return {
        id: getPostDataModelId(postData),
        ownerId: getPostDataModelOwnerId(postData),
        code: getPostDataModelCode(postData),
        timestamp: getPostDataModelTimestamp(postData),
        likes: getPostDataModelLikes(postData),
        videoViews: getPostDataModelVideoViews(postData),
        postType: getPostDataModelPostType(postData),
        comments: getPostDataModelComments(postData),
    }
}

// posts
const getLocationDataModelPostsList = (json) => {
    const posts = json.edge_location_to_top_posts

    if (!posts || posts === undefined) {
        throw Error('[Location Posts] missing in json')
    }

    if (posts.edges === undefined || posts.edges.length === 0) {
        throw Error('posts')
    }

    return posts.edges.map(getPostDataModel)
}

// directory
const getLocationDataModelDirectory = (json) => {
    if (!json.directory || json.directory === undefined) {
        throw Error('directory')
    }

    return json.directory
}

// city name
const getLocationDataModelCityName = (directory) => {
    const city = directory.city

    if (!city || city === undefined) {
        throw Error('[Location City] missing in json')
    }

    if (!city.name || city.name === undefined) {
        throw Error('[Location City name] missing in json')
    }

    return city.name.toLowerCase()
}

// city id
const getLocationDataModelCityId = (directory) => {
    const city = directory.city

    if (!city || city === undefined) {
        throw Error('[Location City] missing in json')
    }

    if (!city.id|| city.id === undefined) {
        throw Error('[Location City Id] missing in json')
    }

    return city.id
}

// country name
const getLocationDataModelCountryName = (directory) => {
    const country = directory.country

    if (!country || country === undefined) {
        throw Error('[Location Country] missing in json')
    }

    if (!country.name || country.name === undefined) {
        throw Error('[Location Country Name] missing in json')
    }

    return country.name.toLowerCase()
}

// country id
const getLocationDataModelCountryId = (directory) => {
    const country = directory.country

    if (!country || country === undefined) {
        throw Error('[Location Country] missing in json')
    }

    if (!country.id|| country.id === undefined) {
        throw Error('[Location Country Id] missing in json')
    }

    return country.id.toLowerCase()
}

// lng
const getLocationDataModelLng = (json) => {
    const longitude = !json.lng || json.lng === undefined
        ? null
        : json.lng

    return longitude
}

// lat
const getLocationDataModelLat = (json) => {
    const latitude = !json.lat || json.lat === undefined
        ? null
        : json.lat

    return latitude
}

// name
const getLocationDataModelName = (json) => {
    const name = json.name

    if (name === undefined) {
        throw Error('[Location Name] missing in json')
    }

    return name.toLowerCase()
}

// id
const getLocationDataModelId = (json) => {
    const id = json.id

    if (!id || id === undefined) {
        throw Error('[Location Id] missing in json')
    }

    return id
}

// data model
const locationDataModel = (json) => {
    if (json.graphql === undefined) {
        throw Error('[graphql] missing in json')
    }

    if (!json.graphql.location || json.graphql.location === undefined) {
        throw Error('[Location] missing in json')
    }

    const location = json.graphql.location

    const postsList = getLocationDataModelPostsList(location)
    const directory = getLocationDataModelDirectory(location)

    try {
        return {
            id: getLocationDataModelId(location),
            name: getLocationDataModelName(location),
            lat: getLocationDataModelLat(location),
            lng: getLocationDataModelLng(location),
            countryId: getLocationDataModelCountryId(directory),
            countryName: getLocationDataModelCountryName(directory),
            cityId: getLocationDataModelCityId(directory),
            cityName: getLocationDataModelCityName(directory),
            postsList,
            avgPostTimestamp: getAvgPostTimestamp(postsList),
        }
    } catch (err) {
        throw new LocationDataModelError(err.message)
    }
}

module.exports = locationDataModel
