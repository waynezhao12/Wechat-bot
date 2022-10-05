
import { log, Message } from 'wechaty';
import axios from 'axios';

export class WeatherService {
  private publicID = 'HE2209302107111773';
  private key = '6892d0322db34c6e858e87ba1497077c';
  private weatherApi = 'https://devapi.qweather.com/v7/weather/now?';
  private geoApi = 'https://geoapi.qweather.com/v2/city/lookup?';
  private airApi = 'https://devapi.qweather.com/v7/air/now?';
  private indicesApi = 'https://devapi.qweather.com/v7/indices/1d?';

  public async getWeather(msg: Message, cityName: string): Promise<any> {
    let weather, geoInfo, weatherInfo, airInfo, indicesInfo;

    const geoCall = await this.getGeoID(cityName).then(
      result => {
        geoInfo = result.data.location[0];
      }
    ).catch(
      error => {
        log.error('geo', error);
        msg.say('获取地理信息失败');
      }
    )
    const weatherCall = await this.getCurrentWeather(geoInfo.id).then(
      result => {
        weatherInfo = result.data.now;
      }
    ).catch(
      error => {
        log.error('weather', error);
        msg.say('获取天气失败');
      }
    )
    const airCall = await this.getCurrentAirQuality(geoInfo.id).then(
      result => {
        airInfo = result.data.now;
      }
    ).catch(
      error => {
        log.error('air', error);
        msg.say('获取空气指数失败');
      }
    )
    const indicesCall = await this.getCurrentIndices(geoInfo.id).then(
      result => {
        indicesInfo = result.data.daily[0];
      }
    ).catch(
      error => {
        log.error('indices', error);
        msg.say('获取生活指数失败');
      }
    )

    let fullName = geoInfo.name === geoInfo.adm2 ? geoInfo.adm1 + geoInfo.name : geoInfo.adm2 + geoInfo.name;
    weather =
      `${fullName}当前天气：
      天气：${weatherInfo.text}
      温度：${weatherInfo.temp}°C
      湿度：${weatherInfo.humidity}°C
      体感温度：${weatherInfo.feelsLike}°C
      ${weatherInfo.windDir}${weatherInfo.windScale}级
      能见度${weatherInfo.vis}公里
      空气质量${airInfo.aqi}，${airInfo.category}
      紫外线指数${indicesInfo.level}，${indicesInfo.category}`;
    return weather;
  }

  private getGeoID(cityName: string): Promise<any> {
    return axios.get(encodeURI(`${this.geoApi}location=${cityName}&key=${this.key}`));
  }

  private getCurrentWeather(geoID: string): Promise<any> {
    return axios.get(encodeURI(`${this.weatherApi}location=${geoID}&key=${this.key}`));
  }

  private getCurrentAirQuality(geoID: string): Promise<any> {
    return axios.get(encodeURI(`${this.airApi}location=${geoID}&key=${this.key}`));
  }

  private getCurrentIndices(geoID: string): Promise<any> {
    return axios.get(encodeURI(`${this.indicesApi}type=5&location=${geoID}&key=${this.key}`));
  }
}

