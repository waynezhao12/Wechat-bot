import fs from 'fs';

import axios from 'axios';

export class DailyNewsService {
	private api = 'https://api.jun.la/60s.php?format=image';
	private api2 = 'https://api.vvhan.com/api/60s';
	async getNews(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			axios({ url: this.api, method: 'GET', responseType: 'stream' })
				.then(
					response => {
						response.data
							.pipe(fs.createWriteStream('news.png'))
							.on('error', e => reject(e))
							.once('close', () => {
								console.log('news saved');
								resolve(true);
							});
					})
				.catch(error => {
					reject(error);
				});
		});
	}
}
