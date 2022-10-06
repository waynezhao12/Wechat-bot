
import { log, Message } from 'wechaty';
import axios from 'axios';

export class WeatherService {
  private publicID = 'HE2209302107111773';
  private key = '6892d0322db34c6e858e87ba1497077c';
  private weatherApi = 'https://devapi.qweather.com/v7/weather/now?';
  private threeDaysWeatherApi = 'https://devapi.qweather.com/v7/weather/3d?';
  private geoApi = 'https://geoapi.qweather.com/v2/city/lookup?';
  private airApi = 'https://devapi.qweather.com/v7/air/now?';
  private indicesApi = 'https://devapi.qweather.com/v7/indices/1d?';

  private geoInfo;

  public async getWeather(cityName: string): Promise<any> {
    let weather, weatherInfo, airInfo, indicesInfo;

    await this.getGeoID(cityName).then(
      res => {
        this.geoInfo = res;
      }
    ).catch(
      err => {
        throw new Error(err);
      }
    )
    const weatherCall = await this.getCurrentWeatherRequest(this.geoInfo.id).then(
      result => {
        weatherInfo = result.data.now;
      }
    ).catch(
      error => {
        throw new Error(error);
      }
    )
    const airCall = await this.getCurrentAirQualityRequest(this.geoInfo.id).then(
      result => {
        airInfo = result.data.now;
      }
    ).catch(
      error => {
        throw new Error(error);
      }
    )
    const indicesCall = await this.getCurrentIndicesRequest(this.geoInfo.id).then(
      result => {
        indicesInfo = result.data.daily[0];
      }
    ).catch(
      error => {
        throw new Error(error);
      }
    )

    let fullName = this.geoInfo.name === this.geoInfo.adm2 ? this.geoInfo.adm1 + this.geoInfo.name : this.geoInfo.adm2 + this.geoInfo.name;
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

  public async getThreeDaysWeather(cityName: string, whichDay: string): Promise<any> {
    let weather, weatherInfo;

    await this.getGeoID(cityName).then(
      res => {
        this.geoInfo = res;
      }
    ).catch(
      err => {
        throw new Error(err);
      }
    )
    const weatherCall = await this.getThreeDaysWeatherRequest(this.geoInfo.id).then(
      result => {
        weatherInfo = result.data.daily;
      }
    ).catch(
      error => {
        throw new Error(error);
      }
    )

    let dayIndex = 0;

    switch (whichDay) {
      case '今天':
        dayIndex = 0
        break;
      case '明天':
        dayIndex = 1
        break;
      case '后天':
        dayIndex = 2
        break;
      default:
        dayIndex = 0
        break;
    }

    let fullName = this.geoInfo.name === this.geoInfo.adm2 ? this.geoInfo.adm1 + this.geoInfo.name : this.geoInfo.adm2 + this.geoInfo.name;
    weather =
      `${fullName}${whichDay}天气：
      白天：${weatherInfo[dayIndex].textDay}
      ${weatherInfo[dayIndex].windDirDay}${weatherInfo[dayIndex].windScaleDay}级
      夜间：${weatherInfo[dayIndex].textDay}
      ${weatherInfo[dayIndex].windDirNight}${weatherInfo[dayIndex].windScaleNight}级
      温度：${weatherInfo[dayIndex].tempMin} - ${weatherInfo[dayIndex].tempMax}°C
      湿度：${weatherInfo[dayIndex].humidity}°C
      能见度${weatherInfo[dayIndex].vis}公里
      紫外线指数${weatherInfo[dayIndex].uvIndex}级`;
    return weather;
  }

  private async getGeoID(cityName: string): Promise<string> {
    let geoId;
    await axios.get(encodeURI(`${this.geoApi}location=${cityName}&key=${this.key}`)).then(
      result => {
        geoId = result.data.location[0];
      }
    ).catch(
      error => {
        throw new Error("获取地理信息失败");
      }
    )
    return geoId;
  }

  private getCurrentWeatherRequest(geoID: string): Promise<any> {
    return axios.get(encodeURI(`${this.weatherApi}location=${geoID}&key=${this.key}`));
  }

  private getCurrentAirQualityRequest(geoID: string): Promise<any> {
    return axios.get(encodeURI(`${this.airApi}location=${geoID}&key=${this.key}`));
  }

  private getCurrentIndicesRequest(geoID: string): Promise<any> {
    return axios.get(encodeURI(`${this.indicesApi}type=5&location=${geoID}&key=${this.key}`));
  }

  private getThreeDaysWeatherRequest(geoID: string): Promise<any> {
    return axios.get(encodeURI(`${this.threeDaysWeatherApi}location=${geoID}&key=${this.key}`));
  }
}

