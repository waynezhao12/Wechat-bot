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
import fs from 'fs';

import { ChatGPTAPI } from 'chatgpt';

import { weatherPush, timeTexts, warningPush, weatherPushFunc } from './schedule-service/schedule-service.js';
import { dailyNewsPush } from './schedule-service/daily-news-service.js';

import { WeatherService } from './weather-query/weather-query.js';
import { PixivLookupService } from './pixiv-lookup/pixiv-lookup.js';
import { AnimeLookupService } from './anime-lookup/anime-lookup.js';
import { CalculatorService } from './calculator-service/calculator-service.js';
import { getHoliday } from './holiday-service/holiday-service.js';
import { AiPaintingService } from './ai-painting/ai-painting.js';

let sessionToken = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..r_Pq22XZfpEp-zdl.7Vg3ZbXrgIxRjjhud-1CG6AaqbGb9h2Cl6JECRIsWcFKMKB20aCfcEqRcSPXPePKLmWPycPu227u7YU5aJFd5C9dxFRzbt2GlS3DPPCtE4_cqRo_wLxIwwXveuRhuEc2mE5KdAezjjRo9mAg_Z1XfQrBgSDYnipu4AhmRJMdqsnqXSoCSDb87z26qHRTZvskMsPeYiAVFYvsaye8ufUeYfXKSMzDDxD2r0bb8-_3Wq-2T3Nia1OUgMuGWUjvx4rkyPzHB3uEnrxVZZ69yENvoOS_w26GriCeE-LQIZ4T9y4XIeHh5HwrcQYfh4Sa00U_joSteOR5mzGfVj-AJMlNCWoa7G5Xk6pBa_yTom2UVb8EVObzbm25jQxmAxW-tqrlJvGvAq1yHhNaD94YsEDMs-oui2srxTAf1k2QKZ4pgbZoPIwoo5QFbrcPqxqSis38W0H70oP6-A2R8Mnx_gsuKba3EHo1uivDdnLj7iic3W2mnr13RTLhLz6Yd_Pb4tbS-YFqhoGgThLOCVVLDcLvTdZbr6-GFG4dgjn9qog77JydUEhydB-A2F81kCqaz2SgrZyhatSdZaRLiOhgvNiq9JYf8FvMRKyCHm2hVzbj835lrhlYgELFL-bFV3RTc-o2nkecSRKiCOr4-wzTB8zP8FH7ktrqJSI6BrZlCeLSttHyzl1qUimYc0c5eAsZBkCQYu0HrwestxycqGmw4kneNIgK_yMYHOnThgP_lqxOv8YrS47RFr1TobMauHG1oFpTkVYaNSCD3lmy1JMsyZmAR6b1VX8Ygja5u65Lz3a-sBWkzJ2FXsg1S7uuf6fhq6xdQXOfS4-fTHs60DYnKYIkNFtFvNtPaXKWA3X96vYaveZdBUKXdtQmqrx9ZalYTxAjMnrHEYFM9n-NSDlkRPOtnPYC7yhBLBB7mIAYSNMaK2rha1qd-qZuUjHRza5Bp93uTl9d9ZPF5BlUU4J9xo8Zaw2LJtEh4xcyAw0T5i7yTm1LuGZsAeF7kLR0zokQoBuWCWAYAzKnzTPoZcEg7s2Q5kgJu2leI0ZPQH1UUbFzchvnB0krOIjXN9-XCc6v-CtPq3iYJgLf9lbXxVszb_EBVpJ3ucxq1J1BoMvOBuwm_eprx3MpZoVEM17F2WMvPXe-O32nfOcUfwqDwfvu8y_FH6Y7MCHW6-PZfEtUtEh3AbOEvhqsuVGIuRwsdGrARAMM_nbXemlXKOVeSyygJ1ZdaW1X2vQoIsz41GN7E3B70VfWD2DmojSG9Uv4YfqQmDfoYss6upEukf5DXwqzc4VSTsPlcMPy7UJpvIGL1OCP6XFY1tTf0vvxCguWIyHs8wv4npW4hak7pFBUq98DwVJSb5uN2MhFQPclFRmiUcMP34VoEFKXhCgTPf0_cxT_BCKs-79PX0ekXCKhs6dnajWJHsi09CjNfwT4elIQ9PPme0TWL8-9c2pFep5raH2ixnK7a-n06DpMVyCLcoUSzC9RnSKtfjLr6rZRJyJPApAOCl5ea7wQJTjejKrM_JKItbW0BuaE3c2gFXvJL1xIwP_GD-r_vriY0I_JK5UZVtK22HixODH6BWGBZhog3ODV49ocf71JfS031-TSKwALI8gPbnsiioUqHW7IAck-PS2aamyJsRklLMBqIRbovuWF4gnwzl-i9GXFWVsHmimCXb5grzAavoozcg07mf17JcZ2Z44Mjd7wMTef9FI9VRfPJrkO6hqtQ644gbKNlxqBeAs49-iYhvvCatNjqCww91o6I-1M1pxnUJ7Youb6eUwJsD06XNKYAJu__SRkf0vln7KyNGFyBKcyPwK6skraj3klE6ULivnAXktkc1zJAB_d0-VXZNGCAgmeVfsVx4uaL6aK1FBiSoz_wAB9GjHJHhTcArTGQYNlnONK4ZU8FB6PGb4XkDHE8lDHVekf4tnRl6VYWlGCRR-t7Oae1jKlqFuqa2yaKa9yfWE9526fk0Tv-4gi-X8rkcoMCiJ4nDco3xCzKU4qjvOwHiMhQOxaskDvDB9UDkBWVKRal9ocghq0EHOd452m6cT1wJDaWa6FReDnPtW7RztZfrFy2XAhBW7pbQbiJebZ2L09TWOkjViXSaFOYRHs3covW6DcBejJPH7N7HyOZyeraXuek-h0tzUHDucLVxSXuaCTAi5w_pF_a4l1dMCsfuspT7aYLIJjlDo6uZErbI_peQ54XNQaMai9-NHzfpeNH0c1KpJXphwzvNg_0BNkybzFSqpVH_RHUPlcioJ6vgDO-yKbPQn3gjBHK_MVa6-lXdPrZQqgvdcDxNH5dzBZd0l-3uazC8e-WOxD9WGrLnmOMOhvWxvDyJTyBc4ymtPgEbaaighiN2aC.DXrgxLjCcJlStddNHUdBGQ';
// let clearanceToken = 'SpiYCDXr0QgcgwKJLrD_ycPq3g_CgGfpSXBFn4HVJks-1670898649-0-1-896f763e.a93849f0.de6e29de-160'
// let userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';
// const api = new ChatGPTAPI({ sessionToken: sessionToken });
// await api.ensureAuth();
// const conversationPool = new Map();

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
const aiPaintingService = new AiPaintingService();

let lastPic: Message;
let lastMsg: Message;
let sameMsgCount: number = 0;

let toRecalledMsg: Message;

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

async function onLogin(user: Contact) {
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

  if (msg.self()) {
    toRecalledMsg = msg;
  }

  // if (msg.type() === bot.Message.Type.Recalled) {
  //   const recalledMessage = await msg.toRecalled();
  //   await console.log(`Message: ${recalledMessage} has been recalled.`);
  //   await msg.say(`"${recalledMessage?.text()}"成功撤回了`);
  // }

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
    } else if (msg.text().includes('油价')) {
      queryFurlPrice(msg, room);
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

  if (msg.text() === '测试天气推送') {
    if (msg.room()) {
      weatherPushFunc('徐州', [msg.room()]);
    }
  }

  if (msg.text().indexOf('/recall') === 0) {
    if (toRecalledMsg) {
      try {
        await toRecalledMsg.recall();
      } catch (error) {
        console.log(error);
        await msg.say('君子一言驷马难追');
      }
    }
  }

  if (msg.text().indexOf('/ai ') === 0) {
    aiPaintingService.createPainting(msg);
  }

  if (msg.text().indexOf('/news') === 0) {
    try {
      let filebox = await FileBox.fromUrl('https://api.03c3.cn/zb/');
      if (filebox) {
        await filebox.toFile('news.png', true).then(
          result => {
            msg.say(FileBox.fromFile('news.png'));
          }
        ).catch(
          error => {
            throw new Error("获取新闻失败");
          }
        )
      }
    } catch (error) {
      console.log(error + '');
    }
  }

  if (msg.text().indexOf('/hi ') === 0) {
    try {
      const room = msg.room();
      if (room) {
        const contact = msg.talker();
        let content = msg.text();
        const request = content.replace('/hi ', '');
        // await chatgptReply(room, contact, request);
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (msg.text().indexOf('今天天气') !== -1) {
    const cityIndex = msg.text().indexOf('今天天气');
    if (cityIndex !== -1 && cityIndex === msg.text().length - 4) {
      await weatherService.getTodayWeather(msg.text().slice(0, cityIndex)).then(
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
      // console.log('same msg');
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

async function queryFurlPrice(msg: Message, room: Room) {
  const cityIndex = msg.text().indexOf('油价');
  const who = msg.talker();
  if (cityIndex !== -1 && cityIndex === msg.text().length - 2) {
    const name = msg.text().slice(10, cityIndex);
    await axios.get(encodeURI(`http://api.tianapi.com/oilprice/index?key=e877d0c19d79029e15dbcf4f5dea0738&prov=${name}`)).then(
      res => {
        const price = res.data.newslist[0];
        if (price) {
          let priceText =
            `${name}油价：
            零号柴油：${price.p0}
            89号汽油：${price.p89}
            92号汽油：${price.p92}
            95号汽油：${price.p95}
            98号汽油：${price.p98}
            更新时间：${price.time}`
          room.say(priceText, who);
        }
      }
    ).catch(
      err => {
        room.say('可莉不知道哦', who);
      }
    )
  }
}

// async function chatgptReply(room, contact, request) {
//   console.log(`contact: ${contact} request: ${request}`);
//   let response = '🤒🤒🤒出了一点小问题，请稍后重试下...';
//   try {
//     const conversation = await getConversion(contact);
//     response = await conversation.sendMessage(request, {
//       timeoutMs: 2 * 60 * 1000,
//     });
//     console.log(`contact: ${contact} response: ${response}`);
//   } catch (e) {
//     if (e.message === 'ChatGPTAPI error 429') {
//       response = '🤯🤯🤯请稍等一下哦，我还在思考你的上一个问题';
//     }
//     console.error(e);
//     // 尝试刷新token
//     if (await !api.getIsAuthenticated()) {
//       // 刷新失败，需要重新登录
//       console.error('Unauthenticated');
//       response = '🤖🤖🤖ChatGPT账号权限过期，需要管理员重新登录后才能继续使用';
//     }
//   }
//   response = `${request} \n ------------------------ \n` + response;
//   const target = room || contact;
//   await send(target, response);
// }

// async function getConversion(contact) {
//   let conversation = conversationPool.get(contact.id);
//   if (!conversation) {
//     conversation = api.getConversation();
//     conversationPool.set(contact.id, conversation);
//   }
//   return conversation;
// }

// async function send(contact, message) {
//   try {
//     await contact.say(message);
//   } catch (e) {
//     console.error(e);
//   }
// }