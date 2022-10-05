import schedule from 'node-schedule';
import {
	log,
	Room,
} from 'wechaty';
import { WechatyInterface } from 'wechaty/impls';
import { WeatherService } from '../weather-query/weather-query.js';

const weatherService = new WeatherService();

export async function weatherPush(bot: WechatyInterface) {
	schedule.scheduleJob('00 0 7 * * *', async () => {
		const roomList = await bot.Room.findAll();
		try {
			await weatherService.getWeather('徐州').then(
				res => {
					log.info('Weather', res);
					roomList.forEach(room => {
						room.say(res)
					})
				}
			).catch(
				err => {
					log.error('Weather', err);
					roomList.forEach(room => {
						room.say(err)
					})
				}
			)
		} catch (error) {
			console.log('Schedule runs failed\n', error)
		}
	})
}
