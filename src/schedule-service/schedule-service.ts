import schedule from 'node-schedule';
import { WechatyInterface } from 'wechaty/impls';
import { WeatherService } from '../weather-query/weather-query.js';

let cityList = ['徐州', '北京'];
let warningIdList: Array<string> = [];

export async function weatherPush(bot: WechatyInterface) {
  schedule.scheduleJob('00 00 7 * * *', async () => {
    const roomList = await bot.Room.findAll();
    try {
      await cityList.forEach(city => {
        const weatherService = new WeatherService();
        weatherService.getTodayWeather(city).then(
          res => {
            console.log(res);

            roomList.forEach(async room => {
              await sleep(1000);
              await room.say(res);
            })
          }
        ).catch(
          err => {
            console.log(err);

            // roomList.forEach(room => {
            //   room.say(err + '')
            // })
          }
        )
      });
    } catch (error) {
      console.log('Schedule runs failed\n', error)
    }
  })
}

export async function timeTexts(bot: WechatyInterface) {
  schedule.scheduleJob('00 50 6 * * *', async () => {
    const roomList = await bot.Room.findAll();
    try {
      roomList.forEach(room => {
        room.say('起床啦起床啦！现在还没起床的都是懒狗！');
      })
    } catch (error) {
      console.log('Schedule runs failed\n', error)
    }
  });

  schedule.scheduleJob('00 0 15 * * *', async () => {
    const roomList = await bot.Room.findAll();
    try {
      roomList.forEach(room => {
        room.say('三点了，饮茶了先！');
      })
    } catch (error) {
      console.log('Schedule runs failed\n', error)
    }
  });

  schedule.scheduleJob('00 0 12 * * *', async () => {
    const roomList = await bot.Room.findAll();
    try {
      roomList.forEach(room => {
        room.say('十二点了，该吃午餐了！');
      })
    } catch (error) {
      console.log('Schedule runs failed\n', error)
    }
  });

  schedule.scheduleJob('00 0 18 * * *', async () => {
    const roomList = await bot.Room.findAll();
    try {
      roomList.forEach(room => {
        room.say('六点了，该加班了！');
      })
    } catch (error) {
      console.log('Schedule runs failed\n', error)
    }
  });

  schedule.scheduleJob('00 0 23 * * *', async () => {
    const roomList = await bot.Room.findAll();
    try {
      roomList.forEach(room => {
        room.say('夜宵这不来个外卖？');
      })
    } catch (error) {
      console.log('Schedule runs failed\n', error)
    }
  });
}

export async function warningPush(bot: WechatyInterface) {
  setInterval(async () => {
    const roomList = await bot.Room.findAll();
    try {
      await cityList.forEach(city => {
        const weatherService = new WeatherService();
        weatherService.getWarning(city).then(
          res => {
            console.log(res);
            let warningIds = res.warningIds;
            let weatherText = res.weatherText;
            if (warningIds && warningIds.length > 0) {
              warningIds.forEach((id, index) => {
                if (warningIdList.indexOf(id) === -1) {
                  warningIdList.push(id);
                  roomList.forEach(async room => {
                    await sleep(1000);
                    await room.say(weatherText[index]);
                  })
                }
              });
            }
          }
        ).catch(
          err => {
            console.log(err);
          }
        )
      });
    } catch (error) {
      console.log('Schedule runs failed\n', error)
    }
  }, 1000 * 60 * 30);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}