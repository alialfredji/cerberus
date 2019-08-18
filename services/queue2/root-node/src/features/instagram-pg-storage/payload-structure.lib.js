
export const setCityPayload = (data) => ([
    data.id,
    data.name,
    data.countryId,
    data.countryName,
    data.nextPage,
    data.locationsList.map(item => item.locationId)
])

export const setCountryPayload = (data) => ([
    data.id,
    data.name,
    data.nextPage,
    data.citiesList.map(item => item.cityId),
])

export const setLocationPayload = (data) => ([
    data.id,
    data.name,
    data.lat,
    data.lng,
    data.countryId,
    data.countryName,
    data.cityId,
    data.cityName,
    data.avgPostTimestamp,
    data.postsList.map(item => item.code),
])

export const setPostPayload = (data) => ([
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
    data.timestamp,
])

export const setProfilePayload = (data) => ([
    data.id,
    data.username,
    data.biography,
    data.externalUrl,
    data.fullName,
    data.isPublic,
    data.isVerified,
    data.picUrl,
    data.picUrlHd,
    data.postsCount,
    data.followers,
    data.followings,
    data.postsList.map(item => item.code),
    [
        data.isBusinessAccount,
        data.businessCategory,
        data.businessEmail,
        data.businessPhone,
        data.businessAddress,
    ],
])