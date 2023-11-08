import schedule from 'node-schedule';
import fs from 'fs';

import {
	log,
	Room,
} from 'wechaty';
import { WechatyInterface } from 'wechaty/impls';
import axios from 'axios';
import { FileBox } from 'file-box';

const api = 'https://api.jun.la/60s.php?format=image';
const api2 = 'https://api.vvhan.com/api/60s';

export async function dailyNewsPush(bot: WechatyInterface) {
	schedule.scheduleJob('00 30 08 * * *', async () => {
		await axios({ url: api, method: 'GET', responseType: 'stream' }).then(
			response =>
				new Promise((resolve, reject) => {
					response.data
						.pipe(fs.createWriteStream('news.png'))
						.on('error', e => reject(e))
						.once('close', async () => {
							const roomList = await bot.Room.findAll();
							try {
								roomList.forEach(async room => {
									try {
										await room.say(FileBox.fromFile('news.png'));
									} catch (error) {
										console.log(error);
									}
								})
							} catch (error) {
								console.log('Schedule runs failed\n', error)
							}
						});
				}),
		).catch(
			err => {
				console.log(err + '');
			}
		)
	})
}