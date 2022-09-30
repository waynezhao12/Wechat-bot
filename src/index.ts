#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 * Wechaty - Conversational RPA SDK for Chatbot Makers.
 *  - https://github.com/wechaty/wechaty
 */
// https://stackoverflow.com/a/42817956/1123955
// https://github.com/motdotla/dotenv/issues/89#issuecomment-587753552
import 'dotenv/config.js';
import {
  Contact,
  Message,
  ScanStatus,
  WechatyBuilder,
  log,
} from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';

import { WeatherService } from './weather-query/weather-query.js';

const weatherService = new WeatherService();

function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')
    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

    qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin(user: Contact) {
  log.info('StarterBot', '%s login', user)
}

function onLogout(user: Contact) {
  log.info('StarterBot', '%s logout', user)
}

async function onMessage(msg: Message) {
  log.info('StarterBot', msg.toString())

  if (msg.text() === 'ding') {
    await msg.say('dong')
  }

  if (msg.text() === '太笨了') {
    await msg.say('你才笨')
  }

  if (msg.text() === '很聪明') {
    await msg.say('确实')
  }

  const cityIndex = msg.text().indexOf('天气')
  if (cityIndex !== -1 && cityIndex === msg.text().length - 2) {
    weatherService.getWeather(msg.text().slice(0, cityIndex)).then(
      res => {
        log.info('Weather', res)
        msg.say(res)
      },
      err => {
        log.error('StarterBot', err)
        msg.say('可莉不知道哦')
      }
    )
  }

  const calculateIndex = msg.text().indexOf('计算')
  if (calculateIndex !== -1 && calculateIndex === 0) {
    let expression = msg.text().slice(2)
    expression = expression.replaceAll('×', '*')
    expression = expression.replaceAll('÷', '/')
    expression = expression.replaceAll('/', '/')
    expression = expression.replaceAll('（', '(')
    expression = expression.replaceAll('）', ')')
    try {
      log.info('expression', expression)
      const result = eval(expression)
      log.info('Calc', result)
      await msg.say(`${result}`)
    } catch (error) {
      await msg.say('可莉不知道哦')
    }
  }
}

const bot = WechatyBuilder.build({
  name: 'wechaty-puppet-wechat',
  /**
   * How to set Wechaty Puppet Provider:
   *
   *  1. Specify a `puppet` option when instantiating Wechaty. (like `{ puppet: 'wechaty-puppet-whatsapp' }`, see below)
   *  1. Set the `WECHATY_PUPPET` environment variable to the puppet NPM module name. (like `wechaty-puppet-whatsapp`)
   *
   * You can use the following providers locally:
   *  - wechaty-puppet-wechat (web protocol, no token required)
   *  - wechaty-puppet-whatsapp (web protocol, no token required)
   *  - wechaty-puppet-padlocal (pad protocol, token required)
   *  - etc. see: <https://wechaty.js.org/docs/puppet-providers/>
   */
  puppet: 'wechaty-puppet-wechat',
  puppetOptions: {
    uos: true  // 开启uos协议
  },

  /**
   * You can use wechaty puppet provider 'wechaty-puppet-service'
   *   which can connect to remote Wechaty Puppet Services
   *   for using more powerful protocol.
   * Learn more about services (and TOKEN) from https://wechaty.js.org/docs/puppet-services/
   */
  // puppet: 'wechaty-puppet-service'
  // puppetOptions: {
  //   token: 'xxx',
  // }
})

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))