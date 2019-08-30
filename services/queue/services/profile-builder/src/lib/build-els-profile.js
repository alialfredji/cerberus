
const buildElsProfile = (data) => ({
    uname: data.username,
    url: data.externalUrl,
    lang: data.langCode,
    text: data.fullText,

    flrs: data.followers,
    price: data.postPrice,
    flrs_7_diff: data.followersGrowth.weekDiff,
    flrs_30_diff: data.followersGrowth.monthDiff,

    eng_rate: data.engagementRate,
    frec_30: data.uploadsMonth,
    flrs_7_perc: data.followersGrowth.weekPerc,
    flrs_30_perc: data.followersGrowth.monthPerc,

    has_email: !!data.emails.length,
    has_buss: data.isBusinessAccount,
    is_verf: data.isVerified,
    is_pub: data.isPublic,

    pp_mtime: data.lastPostUpdate,
    p_mtime: data.lastProfileUpdate,
})

module.exports = {
    buildElsProfile,
}