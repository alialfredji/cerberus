

const structuredPostsList = (postData) => {
    const uniquePosts = []
    return postData
        .filter(post => {
            if (uniquePosts.indexOf(post.payload[0]) === -1) {
                uniquePosts.push(post.payload[0])
                return true
            } else {
                return false
            }
        })
        .map(post => ({
            id: post.payload[0],
            code: post.payload[2],
            caption: post.payload[4],
            likes: post.payload[8],
            comments: post.payload[9],
        }))
}

const calcAvgComments = (postsList) => {
    const totalComments = postsList.reduce((acc, curr) => {
        return acc + curr.comments
    }, 0)

    return Number((totalComments / postsList.length).toFixed(0))
}

const calcAvgLikes = (postsList) => {
    const totalLikes = postsList.reduce((acc, curr) => {
        return acc + curr.likes
    }, 0)

    return Number((totalLikes / postsList.length).toFixed(0))
}

const calcFollowersGrowth = (profileList) => {
    const output = {}
    output.monthDiff = 0
    output.monthPerc = 0
    output.weekDiff = 0
    output.weekPerc = 0

    if (!profileList.length) return output

    const profileListLastWeek = profileList.filter((item, index, arr) => {
        const weekInterval = 3600000 * 24 * 8
        return new Date(arr[0].created_at) - item.created_at < weekInterval
    })

    const lastFollowers = profileList[0].payload[10]
    const lastWeekFollowers = profileListLastWeek[profileListLastWeek.length - 1].payload[10]
    const lastMonthFollowers = profileList[profileList.length - 1].payload[10]

    output.monthDiff = lastFollowers - lastMonthFollowers
    output.weekDiff = lastFollowers - lastWeekFollowers

    output.monthPerc = output.monthDiff / lastMonthFollowers
    output.monthPerc = output.monthPerc !== Infinity ? Number((output.monthPerc).toFixed(3)) : 0
    output.weekPerc = output.weekDiff / lastWeekFollowers
    output.weekPerc = output.weekPerc !== Infinity ? Number((output.weekPerc).toFixed(3)) : 0

    return output
}

const calcPostPrice = ({ followers, avgLikes, engagementRate }) => {
    let estimatedPostPrice = (followers * (5 / 1000)) + ((avgLikes * 0.43) * engagementRate)
    estimatedPostPrice = Math.round(estimatedPostPrice)
    return Math.round(estimatedPostPrice) || 0
}

const calcUploadsMonth = (profileList) => {
    return profileList.length ? profileList.length - 1 : -1
        ? 0
        : Math.round(profileList[0].payload[9] - profileList[lastIndex].payload[9])
}

const calcEngagementRate = ({ followers, avgComments, avgLikes }) => {
    const engagementRate = ((avgComments + avgLikes) / followers).toFixed(3)
    return Number(engagementRate)
}

const findEmails = (bio) => {
    const regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
    const emails = (bio || '').match(regex)
    return emails || []
} 

const profileBuilderDataModel = ({ profileData, postData }) => {
    if (!profileData || !profileData.length) {
        return null
    }

    const latestProfile = profileData[0].payload
    const latestMonthProfileData = profileData.filter((item, index, arr) => {
        const monthInterval = 3600000 * 24 * 32
        return new Date(arr[0].created_at) - item.created_at < monthInterval
    })

    const output = {}
    output.id = latestProfile[0]
    output.username = latestProfile[1]
    output.biography = latestProfile[2]
    output.externalUrl = latestProfile[3]
    output.fullName = latestProfile[4] 
    output.isPublic = latestProfile[5]
    output.isVerified = latestProfile[6]
    output.pic = latestProfile[8]
    output.postsCount = latestProfile[9]
    output.followers = latestProfile[10]
    output.followings = latestProfile[11]
    output.isBusinessAccount = latestProfile[13][0] || false
    output.postsList = structuredPostsList(postData)
    output.followersGrowth = calcFollowersGrowth(latestMonthProfileData)
    output.uploadsMonth = calcUploadsMonth(latestMonthProfileData)
    output.avgLikes = calcAvgLikes(output.postsList)
    output.avgComments = calcAvgComments(output.postsList)
    output.emails = findEmails(output.biography)
    output.engagementRate = calcEngagementRate(output)
    output.postPrice = calcPostPrice(output)
    output.fullText = [
        latestProfile[1],
        latestProfile[2],
        latestProfile[4],
        ...(output.postsList.map(item => item.caption)),
    ].join(' ')

    return output
}

module.exports = {
    profileBuilderDataModel,
}

