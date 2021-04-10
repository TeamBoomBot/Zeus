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

// Launching the bot
bot.launch()
