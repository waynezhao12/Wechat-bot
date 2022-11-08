import schedule from 'node-schedule';
import {
	log,
	Room,
} from 'wechaty';
import { WechatyInterface } from 'wechaty/impls';
import axios from 'axios';
import { FileBox } from 'file-box';

const api = 'https://api.03c3.cn/zb/';

export async function dailyNewsPush(bot: WechatyInterface) {
	schedule.scheduleJob('00 30 8 * * *', async () => {
		const roomList = await bot.Room.findAll();
		try {
			let filebox = FileBox.fromUrl('https://api.03c3.cn/zb/');
			filebox.toFile('news.png', true).then(
				result => {
					roomList.forEach(room => {
						room.say(FileBox.fromFile('news.png'));
					})
				}
			).catch(
				error => {
					throw new Error("获取新闻失败");
				}
			)
		} catch (error) {
			console.log('Schedule runs failed\n', error)
		}
	})
}
