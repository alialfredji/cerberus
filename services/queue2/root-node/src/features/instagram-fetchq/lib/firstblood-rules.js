/**
 * Computes rules for a profile - priority & delay
 *
 * priority: -1  = not an influencer
 * priority: 0   = basic influencer
 */

export const firstbloodRules = (profile) => {
    const {
        isPublic,
        postsCount,
        followers,
        followings,
        avgLikes,
        engagementRate,
        uploadsWeek,
        // videoViewsToFollowersRatio,
        hashtagsPerPost,
        isVerified,
    } = profile

    // delay & priority rules for profiles that doesn't follow requirements
    const rules = (monthsCount, type, value) => ({
        priority: -1,
        monthsCount,
        reason: {
            type,
            value,
        },
    })

    // is public
    if (!isPublic) {
        return rules(12, 'isPublic', isPublic)
    }

    // if profile is verified by instagram. By pass check
    if (isVerified) {
        return { priority: 0 }
    }

    // posts count
    if (postsCount < 30) {
        return rules(6, 'postsCount', postsCount)
    }

    // followers
    if (followers < 10000) {
        if (followers > 8000) {
            return rules(1, 'followers', followers)
        }

        if (followers > 5000) {
            return rules(2, 'followers', followers)
        }

        if (followers > 2000) {
            return rules(4, 'followers', followers)
        }

        return rules(6, 'followers', followers)
    }

    // followings
    if (followings > 5000) {
        if (followings > 10000) {
            return rules(12, 'followings', followings)
        }

        return rules(6, 'followings', followings)
    }

    // average likes
    if (!avgLikes || avgLikes < 300) {
        if (avgLikes > 200) {
            return rules(1, 'avgLikes', avgLikes)
        }

        return rules(6, 'avgLikes', avgLikes)
    }

    // engagement rate
    if (!engagementRate || engagementRate < 0.01) {
        if (followers >= 100000000 && engagementRate >= 0.001) {
            return { priority: 0 }
        }

        if (followers >= 10000000 && engagementRate >= 0.0025) {
            return { priority: 0 }
        }

        if (followers >= 1000000 && engagementRate >= 0.005) {
            return { priority: 0 }
        }

        return rules(2, 'engagementRate', engagementRate)
    }

    // followers less than followings
    if (followers < followings) {
        return rules(6, 'followers < followings', followers < followings)
    }

    // // video views to followers ratio
    // if (videoViewsToFollowersRatio !== null && videoViewsToFollowersRatio < 0.02) {
    //     return rules(6, 'videoViewsToFollowersRatio', videoViewsToFollowersRatio)
    // }

    // hashtags usage check
    if (hashtagsPerPost >= 20) {
        return rules(6, 'too many hashtags/post', hashtagsPerPost)
    }

    // uploads per week
    if (uploadsWeek < 0.1) {
        return rules(6, 'uploadsWeek', uploadsWeek)
    }

    return {
        priority: 0,
    }
}

/*
RULES WE AGREED UPON
====================
* Profile Basic
    * is_private = true (out -> 1 year)
    * media_count < 20 (6 months)
    * followers < 2000 (out -> > 1200 ? 2mounts , > 700  6 months, else 1 year)
    * followings > 5000 (out -> 6 months)
* Posts
    * percentage of posts older than 1 month > 50% (out -> 6 months)
    * if post date < 24h => exclude posts in calculation
    * avg_likes (total_likes/post_count) < 600 (out -> 2 month)
    * engagement rate ( (total_likes/post_count)/followers ) < 1% (out -> 2 months)
*/
