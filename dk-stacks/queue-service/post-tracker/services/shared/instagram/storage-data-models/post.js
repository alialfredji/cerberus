
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

        likesCount,
        commentsCount,
        videoViews,

        sponsorsList,
        taggedList,
        CommentersList,
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