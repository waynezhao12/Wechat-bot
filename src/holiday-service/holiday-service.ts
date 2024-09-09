import schedule from 'node-schedule';
import { RoomInterface, WechatyInterface } from 'wechaty/impls';
import axios from 'axios';
import { log } from 'wechaty';

interface Holiday {
	name: string;
	date: Date;
}
export class HolidayService {
	private holidayApi = 'https://apis.tianapi.com/jiejiari/index';
	private apiKey = process.env.TIANAPI_API_KEY;
	private nextNewYear: Holiday = {
		name: '元旦节',
		date: new Date('2024-01-01')
	}

	public async getHoliday(): Promise<string> {
		const today = new Date();
		const dd = String(today.getDate()).padStart(2, '0');
		const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		const yyyy = String(today.getFullYear());
		const formattedToday = new Date(`${yyyy}-${mm}-${dd}`);

		return await this.getHolidayList(yyyy).then(
			async res => {
				let result = 'null';
				let newslist = res.list;
				if (newslist && newslist.length >= 0) {
					const lastHoliday = newslist[newslist.length - 1].vacation.split('|')[0];
					if (formattedToday > lastHoliday.date) {
						result = await this.getNextYearHoliday();
					} else {
						for (const [index, element] of newslist.entries()) {
							const firstDay = new Date(element.vacation.split('|')[0]);
							let newHoliday: Holiday = { name: element.name, date: firstDay };
							if (formattedToday < newHoliday.date) {
								result = `距离${newHoliday.name}假期还有${this.daysBetween(formattedToday, newHoliday.date)}天`;
								break;
							} else if (formattedToday.getTime() == newHoliday.date.getTime()) {
								result = `今天是${newHoliday.name}，别忘记关闹钟哦`;
								break;
							}
						}
					}
				}
				return result;
			}
		).catch(
			err => {
				console.log(err);
				throw new Error(err);
			}
		)
	}

	async getNextYearHoliday(): Promise<string> {
		const today = new Date();
		const dd = String(today.getDate()).padStart(2, '0');
		const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		const yyyy = String(today.getFullYear());
		const nextyyyy = String(today.getFullYear() + 1);
		const formattedToday = new Date(`${yyyy}-${mm}-${dd}`);

		return await this.getHolidayList(nextyyyy).then(
			res => {
				let result = 'null';
				let newslist = res.list || null;
				if (newslist && newslist.length >= 0) {
					for (const [element, index] of newslist.entries()) {
						const firstDay = new Date(element.vacation.split('|')[0]);
						let newHoliday: Holiday = { name: element.name, date: firstDay };
						if (formattedToday < newHoliday.date) {
							result = `距离${newHoliday.name}假期还有${this.daysBetween(formattedToday, newHoliday.date)}天`;
							break;
						} else if (formattedToday.getTime() == newHoliday.date.getTime()) {
							result = `今天是${newHoliday.name}，别忘记关闹钟哦`;
							break;
						}
					}
				} else {
					result = `距离${this.nextNewYear.name}假期还有${this.daysBetween(formattedToday, this.nextNewYear.date)}天`;
				}
				return result;
			}
		).catch(
			err => {
				console.log(err);
				throw new Error(err);
			}
		)
	}

	async getHolidayList(year: string) {
		let holidayList;
		await axios.get(`${this.holidayApi}?key=${this.apiKey}&date=${year}&type=1`).then(
			result => {
				holidayList = result.data.result;
			}
		).catch(
			error => {
				throw new Error(error);
			}
		)
		return holidayList;
	}

	treatAsUTC(date): number {
		let result = new Date(date);
		result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
		return Number(result);
	}

	daysBetween(startDate, endDate) {
		let millisecondsPerDay = 24 * 60 * 60 * 1000;
		return (this.treatAsUTC(endDate) - this.treatAsUTC(startDate)) / millisecondsPerDay;
	}

	sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}
}
