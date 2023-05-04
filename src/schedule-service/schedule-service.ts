import schedule from 'node-schedule';
import axios from 'axios';
import { Room } from 'wechaty';
import { RoomInterface, WechatyInterface } from 'wechaty/impls';
import { WeatherService } from '../weather-query/weather-query.js';

let cityList = ['徐州', '北京'];
let warningIdList: Array<string> = [];
let lastEarthquakeList = '';

export async function weatherPush(bot: WechatyInterface) {
  schedule.scheduleJob('00 00 7 * * *', async () => {
    const roomList = await bot.Room.findAll();
    cityList.forEach(async city => {
      weatherPushFunc(city, roomList, 3);
    });
  })
}

export async function weatherPushFunc(city, roomList: any[], retries = 3) {
  try {
    console.log(retries);
    const weatherService = new WeatherService();
    await weatherService.getTodayWeather(city).then(
      res => {
        roomList.forEach(async (room) => {
          await sleep(1000);
          await room.say(res);
        });
      }
    ).catch(
      err => {
        console.log(err);
        if (retries > 0) {
          weatherPushFunc(city, roomList, retries - 1);
        } else {
          roomList.forEach(room => {
            room.say(err + '')
          })
        }
      }
    );
  } catch (error) {
    console.log('Schedule runs failed\n', error)
  }
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
      cityList.forEach(city => {
        const weatherService = new WeatherService();
        weatherService.getWarning(city).then(
          res => {
            // console.log(res);
            let warningIds = res.warningIds;
            let weatherText = res.weatherText;
            if (warningIds && warningIds.length > 0) {
              warningIds.forEach((id, index) => {
                if (warningIdList.indexOf(id) === -1) {
                  warningIdList.push(id);
                  roomList.forEach(async (room) => {
                    await sleep(1000);
                    await room.say(weatherText[index]);
                  });
                }
              });
            }
          }
        ).catch(
          err => {
            console.log(err);
          }
        );
      });
    } catch (error) {
      console.log('Schedule runs failed\n', error)
    }
  }, 1000 * 60 * 30);
}

export async function earthquakePush(bot: WechatyInterface) {
  setInterval(async () => {
    const roomList = await bot.Room.findAll();
    try {
      await axios.get('https://api.wolfx.jp/cenc_eqlist.json').then(
        res => {
          if (res.data && res.data['No1'] && JSON.stringify(res.data['No1']) !== lastEarthquakeList) {
            try {
              let eqObj = res.data['No1'];
              if (eqObj && eqObj.latitude && eqObj.longitude && eqObj.magnitude && eqObj.location && eqObj.time && eqObj.depth) {
                let date = new Date(eqObj.time);
                let script =
                  `北京时间${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日${date.getHours()}时${date.getMinutes()}分${date.getSeconds()}秒，位于 (${eqObj.latitude}, ${eqObj.longitude}) 的${eqObj.location}发生${eqObj.magnitude}级地震，震源深度${eqObj.depth}千米`;
                roomList.forEach(async (room) => {
                  await sleep(1000);
                  await room.say(script);
                });
                lastEarthquakeList = JSON.stringify(res.data['No1']);
              }
            } catch (error) {
              console.log(error);
            }
          }
        }
      ).catch(
        err => {
          console.log(err);
        }
      )
    } catch (error) {
      console.log('Schedule runs failed\n', error)
    }
  }, 1000 * 60 * 10);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}