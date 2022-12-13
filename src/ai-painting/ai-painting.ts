import { Message } from 'wechaty';
import axios from 'axios';
import fs from "fs";
import { FileBox } from 'file-box';

export class AiPaintingService {
  private apiUrl = 'https://desert-served-carrying-advanced.trycloudflare.com/generate-stream';

  public async createPainting(msg: Message) {
    let prompt = msg.text().slice(msg.text().indexOf('/ai ') + 4);
    let requestBody = {
      "prompt": "masterpiece, best quality, " + prompt,
      "width": 512,
      "height": 768,
      "scale": 12,
      "sampler": "k_euler_ancestral",
      "steps": 28,
      // "seed": 4226001252,
      "n_samples": 1,
      "ucPreset": 0,
      "uc": "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry"
    };
    await this.queryImg(requestBody).then(
      async res => {
        const b64String = res.data.slice(res.data.indexOf('data:') + 5);
        const fileBox = FileBox.fromBase64(b64String)
        fileBox.toFile('ai.png', true).then(
          res => {
            msg.say(FileBox.fromFile('ai.png'));
          }
        ).catch(
          err => {
            throw new Error("储存图片失败");
          }
        )
      }
    ).catch(
      err => {
        msg.say(err + '');
      }
    )
  }

  private queryImg(requestBody): Promise<any> {
    return axios.post(this.apiUrl,
      requestBody);
  }
}