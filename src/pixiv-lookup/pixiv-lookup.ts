import { log, Message } from 'wechaty'
import axios from 'axios'
import fs from "fs"
import Catbox from 'catbox.moe'

export class PixivLookupService {

  private catboxHash = 'b632e88a82c0d9fdf6e701ab2'
  private apiKey = '6dd4523b6ce53f6deffd61abc7babae8bd900968'

  public async getImg(msg: Message): Promise<any> {
    let queryResult, baseImg, formatResult, catboxUrl

    await this.getBaseImg(msg).then(
      result => {
        baseImg = result
      }
    ).catch(
      error => {
        console.log(error);
        msg.say('获取图片失败')
      }
    )

    await this.uploadImg(baseImg).then(
      result => {
        catboxUrl = '' + result
      }
    ).catch(
      error => {
        console.log(error);
        msg.say('上传图片失败')
      }
    )

    // await this.queryImg(baseImg).then(
    //   result => {
    //     queryResult = result.data.result
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // )

    await this.queryPixiv(catboxUrl).then(
      res => {
        queryResult = res.data.results
        console.log('=====');
        // console.log(JSON.stringify(res.data));
        console.log(JSON.stringify(queryResult));
        console.log('=====');
      }
    ).catch(
      error => {
        console.log('++++');
        console.log(error);
        msg.say('查询图片失败')
      }
    )

    fs.unlink(baseImg, err => {
      if (err) console.log(err)
      console.log('删除图片成功')
    })

    formatResult =
      `查询结果：
      `
    let tmpResult =
      `查询结果：
      `
    // queryResult.forEach(element => {
    //   formatResult +=
    //     `
    //     文件名：${element.filename}
    //     相似度：${element.similarity}
    //     起始位置：${element.from}
    //     视频：${element.video}
    //     图片：${element.image}
    //     `
    // });
    // queryResult.forEach(element => {
    //   formatResult +=
    //     `
    //     标题：${element.data.title}
    //     相似度：${element.header.similarity}
    //     链接：${this.getArrayString(element.data.ext_urls)}
    //     缩略图：${element.header.thumbnail}
    //     `
    // });
    queryResult.forEach(element => {
      console.log(element);
      if (element.header.similarity >= 45) {
        formatResult +=
          `
        标题：${element.data.title || null}
        作者：${element.data.member_name || element.data.jp_name || element.data.eng_name || element.data.creator || element.data.author_name || null}
        相似度：${element.header.similarity || null}
        链接：${element.data.ext_urls && element.data.ext_urls[0] ? element.data.ext_urls[0] : null}
        缩略图：${element.header.thumbnail || null}
        `
      }
    })
    if (formatResult === tmpResult) {
      formatResult = '可莉不知道哦'
    }
    console.log(formatResult)
    return formatResult
  }

  private getArrayString(arr: Array<any>): any {
    let formatString = ''
    arr.forEach(element => {
      formatString += `${element}
      `
    });
    return formatString
  }

  private async getBaseImg(msg: Message): Promise<any> {
    const file = await msg.toFileBox()
    await file.toFile()
    return file.name
  }

  private queryImg(baseImg: any): Promise<any> {
    return axios.post('https://api.trace.moe/search',
      fs.readFileSync(baseImg),
      {
        headers: {
          "Content-Type": "image/jpeg"
        }
      })
  }

  private uploadImg(baseImg) {
    let catbox = new Catbox.Catbox(this.catboxHash)
    return catbox.upload(baseImg)
  }

  private queryPixiv(imageURL: string): Promise<any> {
    console.log(imageURL);
    return axios.get('https://saucenao.com/search.php', {
      params: {
        url: imageURL,
        db: '999',
        api_key: this.apiKey,
        output_type: '2',
        numres: '3'
      }
    })
  }
}
