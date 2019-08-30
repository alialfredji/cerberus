
const { delay } = require('../../../shared/dates')

const builderNextIterationRules = ({
    uploadsMonth,
    followers,
}) => {
    if (followers >= 50000 && uploadsMonth >= 8) {
        return delay(1, 'day')
    }

    if (uploadsMonth >= 16) {
        return delay(2, 'days')
    }

    if (uploadsMonth >= 12) {
        return delay(3, 'days')
    }

    if (uploadsMonth >= 8) {
        return delay(5, 'days')
    }

    return delay(1, 'week')
}

module.exports = builderNextIterationRules
