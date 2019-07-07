
/*

    const value = [
        id,
        username,
        biography,
        externalUrl,
        fullName,
        isPublic,
        isVerified,
        picUrl,
        picUrlHd,

        // metrics
        postsCount,
        followers,
        followings,
        
        postsList, // only post codes
        [ isBusinessAccount, businessCategory, businessEmail, businessPhone, businessAddress ],
    ]
*/

module.exports = (data) => ([
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