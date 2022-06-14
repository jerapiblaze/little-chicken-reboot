const metadata = {
    name: `timeTools`,
    description: `time tools`,
    version: `1.0.0`,
    author: `jerapiblaze`,
}

const { round, trunc } = Math

const timeExtract = (m) => {
    var remain = m

    var days = remain / (24 * 3600 * 1000)
    remain = remain - (trunc(days) * 24 * 3600 * 1000)

    var hours = remain / (3600 * 1000)
    remain = remain - (trunc(hours) * 3600 * 1000)

    var mins = remain / (60 * 1000)
    remain = remain - (trunc(mins) * 60 * 1000)

    var secs = remain / (1000)
    remain = remain - (trunc(secs) * 1000)

    var milisecs = remain

    return { days, hours, mins, secs, milisecs }
}

const ms2human = (m, options) => {
    var { days, hours, mins, secs, milisecs } = timeExtract(m)
    var extracted = [days, hours, mins, secs, milisecs]
    var label = {
        days: 'd',
        hours: 'h',
        minutes: 'm',
        seconds: 's',
        miliseconds: 'ms'
    }
    if ((options) && (options.label)) {
        label = Object.assign(label, options.label)
    }

    label = Object.values(label)
    var output = ''

    var a = 4

    if ((options) && !(isNaN(options.min))) {
        if (options.min >= 4) {
            a = 4
        } else {
            if (options.min <= 0) {
                a = 0
            } else a = options.min
        }
    }

    for (var i = 0; i < a; i++) {
        output += `${trunc(extracted[i])} ${label[i]} `
    }

    if ((options) && (options.roundLast)) {
        output += `${round(extracted[a])} ${label[a]} `
    } else {
        output += `${extracted[a]} ${label[a]} `
    }

    return output
}

module.exports = {
    commandType: 'ultils',
    execute: {
        ms2human,
        timeExtract
    }
}