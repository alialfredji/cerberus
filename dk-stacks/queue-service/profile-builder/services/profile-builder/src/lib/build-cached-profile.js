
const buildCachedProfile = (data) => ({
    id: data.id,
    uname: data.username,
    url: data.externalUrl,
    bio: data.biography,
    fname: data.fullName,
    pic: data.pic,
    lang_id: data.langCode,
    lang_name: data.langName,
    
    flrs: data.followers,
    flgs: data.followings,
    price: data.postPrice,
    flrs_7_diff: data.followersGrowth.weekDiff,
    flrs_30_diff: data.followersGrowth.monthDiff,
    lks: data.avgLikes,
    cmts: data.avgComments,

    eng_rate: data.engagementRate,
    frec_30: data.uploadsMonth,
    flrs_7_perc: data.followersGrowth.weekPerc,
    flrs_30_perc: data.followersGrowth.monthPerc,

    is_buss: data.isBusinessAccount,
    is_verf: data.isVerified,
    is_pub: data.isPublic,

    pp_mtime: data.lastPostUpdate,
    p_mtime: data.lastProfileUpdate,

    emails: data.emails,
})

module.exports = {
    buildCachedProfile,
}