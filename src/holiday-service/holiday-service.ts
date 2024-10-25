import axios from 'axios';

interface Holiday {
	name: string;
	date: Date;
}
export class HolidayService {
	private readonly holidayApi = 'https://apis.tianapi.com/jiejiari/index';
	private readonly apiKey = process.env.TIANAPI_API_KEY;

	private readonly today = new Date();
	private readonly dd = String(this.today.getDate()).padStart(2, '0');
	private readonly mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
	private readonly yyyy = String(this.today.getFullYear());
	private readonly nextyyyy = String(this.today.getFullYear() + 1);
	private readonly formattedToday = new Date(`${this.yyyy}-${this.mm}-${this.dd}`);

	public async getHoliday(): Promise<string> {
		return await this.getHolidayList(this.yyyy).then(
			async res => {
				let result = 'null';
				const status = res.update || false;
				if (status) {
					let newslist = res.list;
					if (newslist && newslist.length >= 0) {
						const lastHoliday = new Date(newslist[newslist.length - 1].vacation.split('|')[0]);
						if (this.formattedToday > lastHoliday) {
							result = await this.getNextYearHoliday();
						} else {
							for (const [index, element] of newslist.entries()) {
								const firstDay = new Date(element.vacation.split('|')[0]);
								let newHoliday: Holiday = { name: element.name, date: firstDay };
								if (this.formattedToday < newHoliday.date) {
									result = `距离${newHoliday.name}假期还有${this.daysBetween(this.formattedToday, newHoliday.date)}天`;
									break;
								} else if (this.formattedToday.getTime() == newHoliday.date.getTime()) {
									result = `今天是${newHoliday.name}，别忘记关闹钟哦`;
									break;
								}
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
		const nextNewYear: Holiday = {
			name: '元旦',
			date: new Date(`${this.nextyyyy}-01-01`)
		}
		return await this.getHolidayList(this.nextyyyy).then(
			res => {
				let result = 'null';
				const status = res.update || false;
				if (status) {
					let newslist = res.list || null;
					if (newslist && newslist.length >= 0) {
						for (const [element, index] of newslist.entries()) {
							const firstDay = new Date(element.vacation.split('|')[0]);
							let newHoliday: Holiday = { name: element.name, date: firstDay };
							if (this.formattedToday < newHoliday.date) {
								result = `距离${newHoliday.name}假期还有${this.daysBetween(this.formattedToday, newHoliday.date)}天`;
								break;
							} else if (this.formattedToday.getTime() == newHoliday.date.getTime()) {
								result = `今天是${newHoliday.name}，别忘记关闹钟哦`;
								break;
							}
						}
					} else {
						result = `距离${nextNewYear.name}还有${this.daysBetween(this.formattedToday, nextNewYear.date)}天`;
					}
				} else {
					result = `距离${nextNewYear.name}还有${this.daysBetween(this.formattedToday, nextNewYear.date)}天`;
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
