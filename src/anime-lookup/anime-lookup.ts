import { Message } from 'wechaty';
import axios from 'axios';
import fs from "fs";

export class AnimeLookupService {

  public async getImg(msg: Message): Promise<any> {
    let queryResult, baseImg, formatResult;

    await this.getBaseImg(msg).then(
      result => {
        baseImg = result;
      }
    ).catch(
      error => {
        console.log(error);
        msg.say('获取图片失败');
      }
    )

    await this.queryImg(baseImg).then(
      result => {
        queryResult = result.data.result;
        console.log(queryResult);

      }
    ).catch(
      error => {
        console.log('++++');
        console.log(error);
        msg.say('查询图片失败');
      }
    )

    fs.unlink(baseImg, err => {
      if (err) console.log(err);
      console.log('删除图片成功');
    })

    formatResult =
      `查询结果：
      `;
    let tmpResult =
      `查询结果：
      `;
    queryResult.forEach((element, index) => {
      if (element.similarity >= 0.45) {
        formatResult +=
          `
        文件名：${element.filename || null}
        相似度：${element.similarity || null}
        起始位置：${element.from || null}
        视频：${element.video || null}
        图片：${element.image || null}
        `
      }
      if (index === 2) return;
    });
    if (formatResult === tmpResult) {
      formatResult = '可莉不知道哦';
    }
    console.log(formatResult);
    return formatResult;
  }

  private getArrayString(arr: Array<any>): any {
    let formatString = '';
    arr.forEach(element => {
      formatString += `${element}
      `;
    });
    return formatString;
  }

  private async getBaseImg(msg: Message): Promise<any> {
    const file = await msg.toFileBox();
    await file.toFile();
    return file.name;
  }

  private queryImg(baseImg: any): Promise<any> {
    return axios.post('https://api.trace.moe/search',
      fs.readFileSync(baseImg),
      {
        headers: {
          "Content-Type": "image/jpeg"
        }
      });
  }
}
