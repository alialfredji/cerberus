
import moment from 'moment'

export const delay = (what, amount) =>
    moment().add(what, amount).format('YYYY-MM-DD HH:mm:ss Z')

export const toDbDate = date =>
    moment(date, 'YYYY-MM-DD HH:mm Z')

export const dateDiffFromNow = date =>
    new Date() - date

export const zeroPad = d =>
    ('0' + d).slice(-2)

export const date2obj = date => ({
    YYYY: date.getUTCFullYear(),
    MM: zeroPad(date.getMonth() + 1),
    DD: zeroPad(date.getDate()),
    hh: zeroPad(date.getHours()),
    mm: zeroPad(date.getMinutes()),
    ss: zeroPad(date.getSeconds()),
})

