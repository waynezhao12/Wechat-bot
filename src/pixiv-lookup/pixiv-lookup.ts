import { log, Message } from 'wechaty';
import axios from 'axios';
import fs from "fs";

export class PixivLookupService {

  public async getImg(msg: Message): Promise<any> {
    let queryResult, baseImg, formatResult
    await this.getBaseImg(msg).then(
      result => {
        baseImg = result
      },
      error => {
        console.log(error);
      }
    )

    await this.queryImg(baseImg).then(
      result => {
        queryResult = result.data.result
      },
      error => {
        console.log(error);
      }
    )

    await fs.unlink(baseImg, err => {
      console.log(err)
    })

    formatResult =
      `查询结果：
      `
    queryResult.forEach(element => {
      formatResult +=
        `
        文件名：${element.filename}
        相似度：${element.similarity}
        起始位置：${element.from}
        视频：${element.video}
        图片：${element.image}
        `
    });
    return formatResult
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
}