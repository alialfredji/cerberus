
const postPushToFirstBlood = (post) => {
    const profiles = []

    post.mentionsList.map(mention => profiles.push({
        subject: mention.username,
        priority: 100,
    }))

    post.sponsorsList.map(sponsor => profiles.push({
        subject: sponsor.username,
        priority: 100,
    }))

    post.taggedList.map(tagged => profiles.push({
        subject: tagged.username,
        priority: 100,
    }))

    return profiles
}

module.exports = postPushToFirstBlood
