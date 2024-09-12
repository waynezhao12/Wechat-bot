import fs from 'fs';
import axios from 'axios';

export class DailyNewsService {
	private apiList = [
		{ name: '03c3', text: 'http://api.03c3.cn/api/zb?type=jsonImg', image: 'http://api.03c3.cn/api/zb?type=img' },
		{ name: 'southerly', text: 'https://api.southerly.top/api/60s?format=json', image: 'https://api.southerly.top/api/60s?format=image' },
		{ name: 'xiaojun', text: 'https://api.jun.la/60s.php?format=imgapi', image: 'https://api.jun.la/60s.php?format=image' }
	];

	async callNewsApi(): Promise<boolean> {
		const today = new Date();
		const dd = String(today.getDate()).padStart(2, '0');
		const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		const yyyy = String(today.getFullYear());
		const formattedToday = new Date(`${yyyy}-${mm}-${dd}`);

		for (const api of this.apiList) {
			return await new Promise((resolve, reject) => {
				axios.get(api.text).then(
					async response => {
						switch (api.name) {
							case '03c3':
								if (formattedToday.getTime() === new Date(response.data.data.datetime).getTime()) {
									return await this.callNewsImageApi(response.data.data.imageurl);
								}
								break;
							case 'southerly':
								if (formattedToday.getTime() === new Date(response.data.data.date).getTime()) {
									return await this.callNewsImageApi(response.data.data.image);
								}
								break;
							case 'xiaojun':
								if (formattedToday.getTime() === new Date(response.data.imageTime).getTime()) {
									return await this.callNewsImageApi(response.data.imageBaidu);
								}
								break;
							default:
								break;
						}
					})
					.catch(error => {
						reject(new Error('Failed to get news from ' + api.name + ': ' + error));
					});
			});
		}
		return await Promise.reject(new Error('全失败了'));
	}
	async callNewsImageApi(api: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			axios.get(api, { responseType: 'stream' }).then(
				response => {
					response.data
						.pipe(fs.createWriteStream('news.png'))
						.on('error', e => reject(new Error('Error creating news file: ' + e)))
						.once('close', () => {
							console.log('news saved');
							resolve(true);
						});
				})
				.catch(error => {
					reject(new Error('Failed to get news: ' + error));
				});
		});
	}
	async getNews(): Promise<boolean> {
		try {
			return await this.callNewsApi();
		} catch (fallbackError) {
			console.error(fallbackError);
			throw new Error('All API calls have failed');
		}
	}
}

