
export const profileDelayRules = (profile, { delay }) => {
    const {
        uploadsWeek,
        followers,
    } = profile

    if (followers >= 50000 && uploadsWeek >= 2) {
        return delay(1, 'day')
    }

    if (uploadsWeek >= 4) {
        return delay(2, 'days')
    }

    if (uploadsWeek >= 3) {
        return delay(3, 'days')
    }

    if (uploadsWeek >= 2) {
        return delay(5, 'days')
    }

    return delay(1, 'week')
}
