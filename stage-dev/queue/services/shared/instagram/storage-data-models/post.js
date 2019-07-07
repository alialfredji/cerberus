
/*

    const value = [
        id,
        ownerId,
        code,
        type,
        caption,
        timestamp,
        thumbnail,
        displayUrl,
        videoUrl,

        // metrics
        likesCount,
        commentsCount,
        videoViews,

        // lists
        sponsorsList,
        taggedList,
        commentsList // only commenters ids
        [ locationName, locationSlug, locationAddress ],
    ]
*/

module.exports = (data) => ([
    data.id,
    data.ownerId,
    data.code,
    data.type,
    data.caption,
    data.thumbnail,
    data.displayUrl,
    data.videoUrl,
    data.likesCount,
    data.commentsCount,
    data.videoViews,
    data.sponsorsList,
    data.taggedList,
    data.commentsSecondList.map(item => item.ownerId),
    [ data.locationName, data.locationSlug, data.locationAddress ],
])