import schedule from 'node-schedule';
import {
	log,
	Room,
} from 'wechaty';
import { WechatyInterface } from 'wechaty/impls';
import { WeatherService } from '../weather-query/weather-query.js';

const weatherService = new WeatherService();

export async function weatherPush(bot: WechatyInterface) {
	schedule.scheduleJob('00 01 7 * * *', async () => {
		const roomList = await bot.Room.findAll();
		try {
			await weatherService.getThreeDaysWeather('徐州', '今天').then(
				res => {
					console.log(res);
					
					roomList.forEach(room => {
						room.say(res)
					})
				}
			).catch(
				err => {
					console.log(err);
					
					roomList.forEach(room => {
						room.say(err + '')
					})
				}
			)
		} catch (error) {
			console.log('Schedule runs failed\n', error)
		}
	})
}

export async function timeTexts(bot: WechatyInterface) {
	schedule.scheduleJob('00 00 7 * * *', async () => {
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
