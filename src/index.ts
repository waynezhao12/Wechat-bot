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
  Room,
} from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';
import axios from 'axios';
import { FileBox } from 'file-box';

import { weatherPush, timeTexts, warningPush } from './schedule-service/schedule-service.js';
import { dailyNewsPush } from './schedule-service/daily-news-service.js';

import { WeatherService } from './weather-query/weather-query.js';
import { PixivLookupService } from './pixiv-lookup/pixiv-lookup.js';
import { AnimeLookupService } from './anime-lookup/anime-lookup.js';
import { CalculatorService } from './calculator-service/calculator-service.js';
import { getHoliday } from './holiday-service/holiday-service.js';

const bot = WechatyBuilder.build({
  name: 'wechaty-puppet-wechat',
  puppet: 'wechaty-puppet-wechat',
  puppetOptions: {
    uos: true  // 开启uos协议
  },
});

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);

bot.start()
  .then(() => log.info('Start', 'Bot Started.'))
  .catch(e => log.error('Start', e));

const weatherService = new WeatherService();
const pixivService = new PixivLookupService();
const animeService = new AnimeLookupService();
const calculatorService = new CalculatorService();

let lastPic: Message;
let lastMsg: Message;
let sameMsgCount: number = 0;

function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('');
    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl);

    qrcodeTerminal.generate(qrcode, { small: true });  // show qrcode on console

  } else {
    log.info('Scan Status', 'onScan: %s(%s)', ScanStatus[status], status);
  }
}

function onLogin(user: Contact) {
  log.info('Login Status', '%s login', user);
  weatherPush(bot);
  dailyNewsPush(bot);
  timeTexts(bot);
  warningPush(bot);
  getHoliday(bot);
}

function onLogout(user: Contact) {
  log.info('Logout Status', '%s logout', user);
}

async function onMessage(msg: Message) {
  log.info('Receive Message', [msg.text(), msg.type().toString()]);

  if (!msg.self()) {
    checkRepeatMsg(msg);
  }

  if (msg.type() === bot.Message.Type.Image) {
    saveImage(msg);
  }

  if (await msg.mentionSelf()) {
    const room = msg.room();
    if (!room) {
      throw new Error('Should never reach here: a mention message must in a room');
    }
    if (msg.text().includes('搜图')) {
      searchPixiv(lastPic);
    } else if (msg.text().includes('查番剧')) {
      searchAnime(lastPic);
    } else {
      rainbowFart(msg, room);
    }
  }

  if (msg.text() === 'ding') {
    await msg.say('dong');
  }

  if (msg.text() === '太笨了') {
    await msg.say('你才笨');
  }

  if (msg.text() === '很聪明') {
    await msg.say('确实');
  }

  if (msg.text().indexOf('今天天气') !== -1) {
    const cityIndex = msg.text().indexOf('今天天气');
    if (cityIndex !== -1 && cityIndex === msg.text().length - 4) {
      await weatherService.getThreeDaysWeather(msg.text().slice(0, cityIndex), '今天').then(
        res => {
          msg.say(res);
        }
      ).catch(
        err => {
          msg.say(err + '');
        }
      )
    }
  } else if (msg.text().indexOf('明天天气') !== -1) {
    const cityIndex = msg.text().indexOf('明天天气');
    if (cityIndex !== -1 && cityIndex === msg.text().length - 4) {
      await weatherService.getThreeDaysWeather(msg.text().slice(0, cityIndex), '明天').then(
        res => {
          msg.say(res);
        }
      ).catch(
        err => {
          msg.say(err + '');
        }
      )
    }
  } else if (msg.text().indexOf('后天天气') !== -1) {
    const cityIndex = msg.text().indexOf('后天天气');
    if (cityIndex !== -1 && cityIndex === msg.text().length - 4) {
      await weatherService.getThreeDaysWeather(msg.text().slice(0, cityIndex), '后天').then(
        res => {
          msg.say(res);
        }
      ).catch(
        err => {
          msg.say(err + '');
        }
      )
    }
  } else if (msg.text().indexOf('天气') !== -1) {
    const cityIndex = msg.text().indexOf('天气');
    if (cityIndex !== -1 && cityIndex === msg.text().length - 2) {
      await weatherService.getWeather(msg.text().slice(0, cityIndex)).then(
        res => {
          msg.say(res);
        }
      ).catch(
        err => {
          msg.say(err + '');
        }
      )
    }
  }

  const calculateIndex = msg.text().indexOf('计算');
  if (calculateIndex !== -1 && calculateIndex === 0) {
    calculatorService.calculator(msg);
  }
}

// Custom functions

function checkRepeatMsg(msg: Message) {
  if (lastMsg) {
    if (lastMsg.text() === msg.text()) {
      console.log('same msg');
      sameMsgCount += 1;
      if (sameMsgCount === 2) {
        let room = msg.room();
        if (room) {
          msg.forward(room);
        }
        sameMsgCount = -1;
      }
    } else {
      lastMsg = msg;
      sameMsgCount = 0;
    }
  } else {
    lastMsg = msg;
    sameMsgCount = 0;
  }
}

function saveImage(msg: Message) {
  lastPic = msg;
}

async function searchPixiv(msg: Message) {
  if (lastPic) {
    try {
      await pixivService.getImg(msg).then(
        res => {
          msg.say(res);
        }
      ).catch(
        err => {
          msg.say(err + '');
        }
      )
    } catch (error) {
      msg.say('可莉不知道哦');
    }
  } else {
    msg.say('可莉把图片弄丢了');
  }
}

async function searchAnime(msg: Message) {
  if (lastPic) {
    try {
      await animeService.getImg(msg).then(
        res => {
          msg.say(res);
        }
      ).catch(
        err => {
          msg.say(err + '');
        }
      )
    } catch (error) {
      msg.say('可莉不知道哦');
    }
  } else {
    msg.say('可莉把图片弄丢了');
  }
}

async function rainbowFart(msg: Message, room: Room) {
  const who = msg.talker();
  axios.get('https://api.shadiao.pro/chp').then(
    res => {
      room.say(res.data.data.text, who);
    }
  ).catch(
    err => {
      room.say('干啥', who);
    }
  )
}
