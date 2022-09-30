
import { log } from 'wechaty';
import axios from 'axios';

export class WeatherService {
  private publicID = 'HE2209302107111773'
  private key = '6892d0322db34c6e858e87ba1497077c'
  private weatherApi = 'https://devapi.qweather.com/v7/weather/now?'
  private geoApi = 'https://geoapi.qweather.com/v2/city/lookup?'
  private airApi = 'https://devapi.qweather.com/v7/air/now?'
  private indicesApi = 'https://devapi.qweather.com/v7/indices/1d?'

  public async getWeather(cityName: string): Promise<any> {
    let weather
    let geoInfo
    let weatherInfo
    let airInfo
    let indicesInfo

    const geoCall = await this.getGeoID(cityName).then(
      result => {
        geoInfo = result.data.location[0]
        // log.info('Geo response', geoInfo.code)
        // log.info('Geo response', JSON.stringify(geoInfo))
      },
      error => {
        log.error('StarterBot', error)
      }
    )
    const weatherCall = await this.getCurrentWeather(geoInfo.id).then(
      result => {
        weatherInfo = result.data.now
        // log.info('Weather response', JSON.stringify(weatherInfo))
      },
      error => {
        log.error('StarterBot', error)
      }
    )
    const airCall = await this.getCurrentAirQuality(geoInfo.id).then(
      result => {
        airInfo = result.data.now
        // log.info('Weather response', JSON.stringify(weatherInfo))
      },
      error => {
        log.error('StarterBot', error)
      }
    )
    const indicesCall = await this.getCurrentIndices(geoInfo.id).then(
      result => {
        indicesInfo = result.data.daily[0]
        // log.info('Weather response', JSON.stringify(weatherInfo))
      },
      error => {
        log.error('StarterBot', error)
      }
    )

    log.info('Weather response', JSON.stringify(weatherInfo))

    let fullName = geoInfo.name === geoInfo.adm2 ? geoInfo.adm1 + geoInfo.name : geoInfo.adm2 + geoInfo.name
    weather = await
      `${fullName}当前天气：
      天气：${weatherInfo.text}
      温度：${weatherInfo.temp}°C
      湿度：${weatherInfo.humidity}°C
      体感温度：${weatherInfo.feelsLike}°C
      ${weatherInfo.windDir}${weatherInfo.windScale}级
      能见度${weatherInfo.vis}公里
      空气质量${airInfo.aqi}，${airInfo.category}
      紫外线指数${indicesInfo.level}，${indicesInfo.category}`

    log.info('Weather response', weather)

    return weather
  }

  private getGeoID(cityName: string): Promise<any> {
    return axios.get(encodeURI(`${this.geoApi}location=${cityName}&key=${this.key}`))
  }

  private getCurrentWeather(geoID: string): Promise<any> {
    return axios.get(encodeURI(`${this.weatherApi}location=${geoID}&key=${this.key}`))
  }

  private getCurrentAirQuality(geoID: string): Promise<any> {
    return axios.get(encodeURI(`${this.airApi}location=${geoID}&key=${this.key}`))
  }

  private getCurrentIndices(geoID: string): Promise<any> {
    return axios.get(encodeURI(`${this.indicesApi}type=5&location=${geoID}&key=${this.key}`))
  }
}

