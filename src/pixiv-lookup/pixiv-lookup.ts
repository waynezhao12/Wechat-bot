import { log, Message } from 'wechaty';
import axios from 'axios';
import fs from "fs";
import Catbox from 'catbox.moe';

export class PixivLookupService {

  private catboxHash = process.env.CATBOX_HASH_KEY;
  private apiKey = process.env.CATBOX_API_KEY;

  public async getImg(msg: Message): Promise<any> {
    let queryResult, baseImg, formatResult, catboxUrl;

    await this.getBaseImg(msg).then(
      result => {
        baseImg = result;
      }
    ).catch(
      error => {
        throw new Error("获取图片失败");
      }
    )

    await this.uploadImg(baseImg).then(
      result => {
        catboxUrl = '' + result;
      }
    ).catch(
      error => {
        throw new Error("上传图片失败");
      }
    )
    await msg.say('查询中...');
    await this.queryPixiv(catboxUrl).then(
      res => {
        queryResult = res.data.results;
        fs.unlink(baseImg, err => {
          if (err) console.log(err);
          console.log('删除图片成功');
        })
        if (!queryResult) {
          throw new Error("查询图片失败");
        }
      }
    ).catch(
      error => {
        fs.unlink(baseImg, err => {
          if (err) console.log(err);
          console.log('删除图片成功');
        })
        throw new Error("查询图片失败");
      }
    )

    formatResult =
      `查询结果：
      `;
    let tmpResult =
      `查询结果：
      `;
    if (queryResult && queryResult.length > 0) {
      queryResult.forEach(element => {
        if (element.header.similarity >= 45) {
          formatResult +=
            `
            标题：${element.data.title || null}
            作者：${element.data.member_name || element.data.jp_name || element.data.eng_name || element.data.creator || element.data.author_name || null}
            相似度：${element.header.similarity || null}
            链接：${element.data.ext_urls && element.data.ext_urls[0] ? element.data.ext_urls[0] : null}
            缩略图：${element.header.thumbnail || null}
            `;
        }
      })
    }
    if (formatResult === tmpResult) {
      formatResult = '可莉不知道哦';
    }
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

  private uploadImg(baseImg) {
    let catbox = new Catbox.Catbox(this.catboxHash);
    return catbox.upload(baseImg);
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
    });
  }
}
