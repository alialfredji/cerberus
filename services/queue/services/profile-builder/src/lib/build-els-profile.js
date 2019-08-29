
const buildElsProfile = (data) => ({
    uname: data.username,
    url: data.externalUrl,
    lang: data.langCode || null,
    text: data.fullText, // bio, full_name, username, external_url, post captions

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

    updated_at: new Date(),
})

module.exports = {
    buildElsProfile,
}