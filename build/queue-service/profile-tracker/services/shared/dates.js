
let moment

const delay = (what, amount) => moment().add(what, amount).format('YYYY-MM-DD HH:mm:ss Z')

const toDbDate = date => moment(date, 'YYYY-MM-DD HH:mm Z')

const dateDiffFromNow = date => new Date() - date

const zeroPad = d => ('0' + d).slice(-2)

const date2obj = date => ({
    YYYY: date.getUTCFullYear(),
    MM: zeroPad(date.getMonth() + 1),
    DD: zeroPad(date.getDate()),
    hh: zeroPad(date.getHours()),
    mm: zeroPad(date.getMinutes()),
    ss: zeroPad(date.getSeconds()),
})

const register = ({ registerAction, settings }) => {
    const { hooksLib, momentLib } = settings
    const { SERVICE, INIT_SERVICES } = hooksLib

    registerAction({
        hook: INIT_SERVICES,
        name: `${SERVICE} dates`,
        trace: __filename,
        handler: () => {
            moment = momentLib
        },
    })
}

module.exports = {
    register,
    delay,
    toDbDate,
    dateDiffFromNow,
    date2obj,
}
