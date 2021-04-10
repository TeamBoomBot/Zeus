import { Telegraf } from 'telegraf'
import logger from './logging/logger'
import schedule from 'node-schedule'
import { allContests } from './api/kickStart/kickstart'
import { upcomingContestsCodeforces, runningContestsCodeforces } from './api/codeforces/codeforces'
import { upcomingContestsCodeChef, runningContestsCodeChef } from './api/codechef/codechef'
import { upcomingContestsAtcoder } from './api/atcoder/atcoder'
import { getCodeforcesString, getAtcoderString, getCodeChefStringUpcoming, getCodeChefStringRunning, getTime, getKickStart } from './api/apiConstants'
import { constants } from './constants'
import dotenv from 'dotenv'
import { promisify } from 'util'
import redis from 'redis'
import Extra from 'telegraf/extra'
dotenv.config()

let bot
if (process.env.TOKEN != null) {
  bot = new Telegraf(process.env.TOKEN)
} else {
  logger.error('Bot token invalid or null')
  process.exit(2)
}

bot.start((ctx) => {
  try {
    ctx.reply(constants.startMessage)
    logger.info('Bot started perfectly')
  } catch (e) {
    logger.error('Bot could not start\n:' + e)
  }
})
bot.help((ctx) => {
  try {
    ctx.reply(constants.helpMessage)
    logger.info('Help ran perfectly')
  } catch (e) {
    logger.error('Help was not succesful\n:' + e)
  }
})

// RESULTS
bot.hears('0', (ctx) => {
  const userName = ctx.from.first_name
  const helloText = '<i>Hello</i>, ' + userName + '!'
  return helloText
})

// For Codeforces:
bot.command('cf_upcoming', async (ctx) => {
  const result = await upcomingContestsCodeforces()
  let s = ''
  for (const i of result.result) {
    s = s + '\n\n' + getCodeforcesString(i.name, i.id, i.startTimeSeconds)
  }
  try {
    if (s === '') {
      ctx.reply(constants.noContestMessage)
      logger.info('Command (cf_upcoming) ran perfectly')
    } else {
      ctx.reply(constants.codeForcesReplyUpcoming + s, Extra.HTML())
      logger.info('Command (cf_upcoming) ran perfectly')
    }
  } catch (e) {
    logger.error('Command (cf_upcoming) not succesful\n:' + e)
  }
})

bot.command('cf_running', async (ctx) => {
  const result = await runningContestsCodeforces()
  let s = ''
  for (const i of result.result) {
    s = s + '\n\n' + getCodeforcesString(i.name, i.id, i.startTimeSeconds)
  }
  try {
    if (s === '') {
      ctx.reply(constants.noContestMessage)
      logger.info('Command (cf_running) ran perfectly')
    } else {
      ctx.reply(constants.codeForcesReplyRunning + s, Extra.HTML())
      logger.info('Command (cf_running) ran perfectly')
    }
  } catch (e) {
    logger.error('Command (cf_running) not succesful\n:' + e)
  }
})

// For Codechef:
bot.command('cc_upcoming', async (ctx) => {
  const result = await upcomingContestsCodeChef()
  let s = ''
  for (const i of result.result) {
    s = s + '\n\n' + getCodeChefStringUpcoming(i.name, i.code, i.startDate)
  }
  try {
    if (s === '') {
      ctx.reply(constants.noContestMessage)
      logger.info('Command (cc_upcoming) ran perfectly')
    } else {
      ctx.reply(constants.codeChefReplyUpcoming + s, Extra.HTML())
      logger.info('Command (cc_upcoming) ran perfectly')
    }
  } catch (e) {
    logger.error('Command (cc_upcoming) not succesful\n:' + e)
  }
})
bot.command('cc_running', async (ctx) => {
  const result = await runningContestsCodeChef()
  let s = ''
  for (const i of result.result) {
    s = s + '\n\n' + getCodeChefStringRunning(i.name, i.code, i.endDate)
  }
  try {
    if (s === '') {
      ctx.reply(constants.noContestMessage)
      logger.info('Command (cc_running) ran perfectly')
    } else {
      ctx.reply(constants.codeChefReplyRunning + s, Extra.HTML())
      logger.info('Command (cc_running) ran perfectly')
    }
  } catch (e) {
    logger.error('Command (cc_running) not succesful\n:' + e)
  }
})

// For Atcoder:
bot.command('ac_contests', async (ctx) => {
  const events = await upcomingContestsAtcoder()
  let s = ''
  for (const i of events.result) {
    s = s + '\n\n' + getAtcoderString(i.title, i.id, i.startTimeSeconds)
  }
  try {
    if (s === '') {
      ctx.reply(constants.noContestMessage)
      logger.info('Command (ac_contests) ran perfectly')
    } else {
      ctx.reply(constants.atCoderReply + s, Extra.HTML())
      logger.info('Command (ac_contests) ran perfectly')
    }
  } catch (e) {
    logger.error('Command (ac_contests) not succesful\n:' + e)
  }
})

// For Google's Kickstart
bot.command('ks_contests', async (ctx) => {
  const events = allContests
  let s = ''
  for (const i of events) {
    s = s + '\n\n' + getKickStart(i.name, i.startDate, i.startTime)
  }
  try {
    if (s === '') {
      ctx.reply(constants.noContestMessage)
      logger.info('Command (ks_contests) ran perfectly')
    } else {
      ctx.reply(constants.kickStartReply + s, Extra.HTML())
      logger.info('Command (ks_contests) ran perfectly')
    }
  } catch (e) {
    logger.error('Command (ks_contests) not succesful\n:' + e)
  }
})

// Misc all
bot.command('upcoming', async (ctx) => {
  const eventsCF = await upcomingContestsCodeforces()
  const eventsCC = await upcomingContestsCodeChef()
  const eventsAC = await upcomingContestsAtcoder()
  let resultString = ''
  for (const i of eventsCF.result) {
    resultString = resultString + '\n\n' + getCodeforcesString(i.name, i.id, i.startTimeSeconds)
  }
  for (const i of eventsCC.result) {
    resultString = resultString + '\n\n' + getCodeChefStringUpcoming(i.name, i.code, i.startDate)
  }
  for (const i of eventsAC.result) {
    resultString = resultString + '\n\n' + getAtcoderString(i.title, i.id, i.startTimeSeconds)
  }
  try {
    if (resultString === '') {
      ctx.reply(constants.noContestMessage)
      logger.info('Command (upcoming) ran perfectly')
    } else {
      ctx.reply(constants.miscReplyUpcoming + resultString, Extra.HTML())
      logger.info('Command (upcoming) ran perfectly')
    }
  } catch (e) {
    logger.error('Command (upcoming) not succesful\n:' + e)
  }
})

bot.command('running', async (ctx) => {
  const eventsCF = await runningContestsCodeforces()
  const eventsCC = await runningContestsCodeChef()
  let resultString = ''
  for (const i of eventsCF.result) {
    resultString = resultString + '\n\n' + getCodeforcesString(i.name, i.id, i.startTimeSeconds)
  }
  for (const i of eventsCC.result) {
    resultString = resultString + '\n\n' + getCodeChefStringRunning(i.name, i.code, i.endDate)
  }
  try {
    if (resultString === '') {
      ctx.reply(constants.noContestMessage)
      logger.info('Command (running) ran perfectly')
    } else {
      ctx.reply(constants.miscReplyRunning + resultString, Extra.HTML())
      logger.info('Command (running) ran perfectly')
    }
  } catch (e) {
    logger.error('Command (running) not succesful\n:' + e)
  }
})

// Editorial
bot.command('sites', (ctx) => {
  try {
    ctx.reply(constants.sitesMessage)
    logger.info('Command (sites) ran perfectly')
  } catch (e) {
    logger.error('Command (sites) not succesful\n:' + e)
  }
})

// scheduled messages
bot.command('subscribe', async (ctx) => {
  const eventsCodechef = await upcomingContestsCodeChef()
  for (const i of eventsCodechef.result) {
    const yearContest = i.startDate.toString().substring(0, 4)
    const monthContest = parseInt(i.startDate.toString().substring(5, 7))
    const dayContest = i.startDate.toString().substring(8, 10)
    const hoursContest = i.startDate.toString().substring(11, 16)
    const dayPreviousReminder = new Date(parseInt(yearContest), monthContest, parseInt(dayContest) - 1, 10, 0, 0)
    const daySameReminder = new Date(parseInt(yearContest), monthContest, parseInt(dayContest), parseInt(hoursContest) - 1, 0, 0)
    schedule.scheduleJob(dayPreviousReminder, function () {
      ctx.reply('One day before reminder - Codechef\n' + getCodeChefStringUpcoming(i.name, i.code, i.startDate), Extra.HTML())
    })
    schedule.scheduleJob(daySameReminder, function () {
      ctx.reply('One hour before reminder - Codechef\n' + getCodeChefStringUpcoming(i.name, i.code, i.startDate), Extra.HTML())
    })
  }

  const eventsCodeforces = await upcomingContestsCodeforces()
  for (const i of eventsCodeforces.result) {
    const yearContest = getTime(i.startTimeSeconds).substring(6, 11)
    const monthContest = getTime(i.startTimeSeconds).substring(2, 6)
    const dayContest = getTime(i.startTimeSeconds).substring(0, 2)
    const hoursContest = getTime(i.startTimeSeconds).toString().substring(17, 19)
    const d = Date.parse(monthContest + '1, 2021')
    const final = new Date(d).getMonth()
    const dayPreviousReminder = new Date(parseInt(yearContest), final, parseInt(dayContest) - 1, 10, 0, 0)
    const daySameReminder = new Date(parseInt(yearContest), final, parseInt(dayContest), parseInt(hoursContest) - 1, 0, 0)
    schedule.scheduleJob(dayPreviousReminder, function () {
      ctx.reply('One day before reminder - codeForces\n' + getCodeforcesString(i.name, i.id, i.startTimeSeconds), Extra.HTML())
    })
    schedule.scheduleJob(daySameReminder, function () {
      ctx.reply('One hour before reminder - Codeforces\n' + getCodeforcesString(i.name, i.id, i.startTimeSeconds), Extra.HTML())
    })
  }

  const eventsAtcoder = await upcomingContestsAtcoder()
  for (const i of eventsAtcoder.result) {
    const yearContest = getTime(i.startTimeSeconds).substring(6)
    const monthContest = getTime(i.startTimeSeconds).substring(2, 6)
    const dayContest = getTime(i.startTimeSeconds).substring(0, 2)
    const hoursContest = getTime(i.startTimeSeconds).toString().substring(0, 2)
    const d = Date.parse(monthContest + '1, 2021')
    const final = new Date(d).getMonth()
    const dayPreviousReminder = new Date(parseInt(yearContest), final, parseInt(dayContest) - 1, 10, 0, 0)
    const daySameReminder = new Date(parseInt(yearContest), final, parseInt(dayContest), parseInt(hoursContest) - 1, 0, 0)
    schedule.scheduleJob(dayPreviousReminder, function () {
      ctx.reply('One day before reminder - Atcoder \n' + getAtcoderString(i.title, i.id, i.startTimeSeconds), Extra.HTML())
    })
    schedule.scheduleJob(daySameReminder, function () {
      ctx.reply('One hour before reminder - Atcoder\n' + getAtcoderString(i.title, i.id, i.startTimeSeconds), Extra.HTML())
    })
  }
  ctx.reply('You have successfully subscribed to receive reminders for all the upcoming contests!')
})

// Redis
export const client = redis.createClient(process.env.REDIS_URL)
export const redisSet = promisify(client.set).bind(client)
export const redisGet = promisify(client.get).bind(client)

client.on('connect', function () {
  try {
    logger.info('Redis Client is connected')
  } catch (e) {
    logger.error('Unable to connect with the Redis Client')
  }
})

// Launching the bot
bot.launch()
