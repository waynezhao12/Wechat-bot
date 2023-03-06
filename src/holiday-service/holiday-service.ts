import schedule from 'node-schedule';
import { RoomInterface, WechatyInterface } from 'wechaty/impls';
import axios from 'axios';


const holidayApi = 'http://api.tianapi.com/jiejiari/index?';
const apiKey = process.env.TIANAPI_API_KEY;

interface Holiday {
	name: string;
	date: Date;
}

const nextNewYear: Holiday = {
	name: '元旦节',
	date: new Date('2022-12-31')
}

export async function getHoliday(bot: WechatyInterface) {
	schedule.scheduleJob('01 00 00 * * *', async () => {
		const roomList = await bot.Room.findAll();
		try {
			const today = new Date();
			const dd = String(today.getDate()).padStart(2, '0');
			const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
			const yyyy = String(today.getFullYear());
			const formattedToday = new Date(`${yyyy}-${mm}-${dd}`);

			await getHolidayList(yyyy).then(
				async res => {
					let newslist = res.newslist;
					if (newslist && newslist.length >= 0) {
						for (const [index, element] of newslist.entries()) {
							const firstDay = new Date(element.vacation.split('|')[0]);
							let newHoliday: Holiday = { name: element.name, date: firstDay };
							if (formattedToday < newHoliday.date) {
								roomList.forEach(async room => {
									await sleep(1000);
									await room.say(`距离${newHoliday.name}假期还有${daysBetween(formattedToday, newHoliday.date)}天`);
								})
								break;
							} else if (formattedToday == newHoliday.date) {
								roomList.forEach(async room => {
									await sleep(1000);
									await room.say(`今天是${newHoliday.name}，别忘记关闹钟哦`);
								})
								break;
							}
							if ((index === newslist.length - 1) && (formattedToday > newHoliday.date)) {
								await getNextYearHoliday(bot, roomList);
							}
						}
					}
				}
			).catch(
				err => {
					console.log(err);
					throw new Error(err);
				}
			)
		} catch (error) {
			console.log('Schedule runs failed\n', error)
		}
	})
}

async function getNextYearHoliday(bot: WechatyInterface, roomList: RoomInterface[]) {
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	const yyyy = String(today.getFullYear());
	const nextyyyy = String(today.getFullYear() + 1);
	const formattedToday = new Date(`${yyyy}-${mm}-${dd}`);

	await getHolidayList(nextyyyy).then(
		res => {
			let newslist = res.newslist || null;
			if (newslist && newslist.length >= 0) {
				for (const [element, index] of newslist.entries()) {
					const firstDay = new Date(element.vacation.split('|')[0]);
					let newHoliday: Holiday = { name: element.name, date: firstDay };
					if (formattedToday < newHoliday.date) {
						roomList.forEach(async room => {
							await sleep(1000);
							await room.say(`距离${newHoliday.name}假期还有${daysBetween(formattedToday, newHoliday.date)}天`);
						})
						break;
					} else if (formattedToday == newHoliday.date) {
						roomList.forEach(async room => {
							await sleep(1000);
							await room.say(`今天是${newHoliday.name}，别忘记关闹钟哦`);
						})
						break;
					}
				}
			} else {
				roomList.forEach(async room => {
					await sleep(1000);
					await room.say(`距离${nextNewYear.name}假期还有${daysBetween(formattedToday, nextNewYear.date)}天`);
				})
			}
		}
	).catch(
		err => {
			console.log(err);
			throw new Error(err);
		}
	)
}

async function getHolidayList(year: string) {
	let holidayList;
	await axios.get(`${holidayApi}key=${apiKey}&date=${year}&type=1`).then(
		result => {
			holidayList = result.data;
		}
	).catch(
		error => {
			throw new Error(error);
		}
	)
	return holidayList;
}

function treatAsUTC(date): number {
	var result = new Date(date);
	result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
	return Number(result);
}

function daysBetween(startDate, endDate) {
	var millisecondsPerDay = 24 * 60 * 60 * 1000;
	return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}