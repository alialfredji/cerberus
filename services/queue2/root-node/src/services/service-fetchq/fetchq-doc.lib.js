
import { getClient } from './fetchq.lib'
import moment from 'moment'

export const append = ({
    queue,
    payload,
    version = 0,
    priority = 0,
    settings = {}
}) => new Promise((resolve, reject) => {
    const doit = () => getClient().doc.append(queue, payload, version, priority)

    if (!settings.throttle) {
        doit()
        return resolve()
    }

    // setup timers cache at first execution
    if (!append.timers) {
        append.timers = {}
    }

    // in memory throtthle
    const timerSubject = `${queue}-${settings.throttleId}`
    clearTimeout(append.timers[timerSubject])
    append.timers[timerSubject] = setTimeout(() => {
        doit()
        resolve()
    }, settings.throttle)
})

// @TODO: even if we add "settings.throttle", it should return a promise!
export const push = ({ queue, settings }) => {
    const { delay, ...other } = settings

    if (delay) {
        other.nextIteration = moment().add(delay[0], delay[1]).format('YYYY-MM-DD HH:mm:ss Z')
    }

    return getClient().doc.push(queue, other)
}

export const pushMany = ({ queue, settings }) => {
    const { delay, ...other } = settings

    if (delay) {
        other.nextIteration = moment().add(delay[0], delay[1]).format('YYYY-MM-DD HH:mm:ss Z')
    }

    return getClient().doc.pushMany(queue, other)
}


// @TODO: even if we add "settings.throttle", it should return a promise!
export const upsert = ({ queue, settings }) => {
    const { delay, ...other } = settings

    // setup timers cache at first execution
    if (!upsert.timers) {
        upsert.timers = {}
    }

    // in memory throtthle
    clearTimeout(upsert.timers[`${queue}-${settings.subject}`])
    upsert.timers[`${queue}-${settings.subject}`] = setTimeout(() => {
        if (delay) {
            other.nextIteration = moment().add(delay[0], delay[1]).format('YYYY-MM-DD HH:mm:ss Z')
        }

        return getClient().doc.upsert(queue, other)
    }, settings.throttle || 0)
}