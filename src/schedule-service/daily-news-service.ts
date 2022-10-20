import schedule from 'node-schedule';
import {
	log,
	Room,
} from 'wechaty';
import { WechatyInterface } from 'wechaty/impls';
import axios from 'axios';
import { FileBox } from 'file-box';

const api = 'http://bjb.yunwj.top/php/tp/lj.php';

export async function dailyNewsPush(bot: WechatyInterface) {
	schedule.scheduleJob('00 00 9 * * *', async () => {
		const roomList = await bot.Room.findAll();
		try {
			await axios.get(api).then(
				result => {
					roomList.forEach(room => {
						room.say(FileBox.fromUrl(result.data.tp))
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
