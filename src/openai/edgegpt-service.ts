import { Message } from 'wechaty';
import axios from 'axios';
import { FileBox } from 'file-box';

// const httpsAgent = HttpsProxyAgent({ host: "127.0.0.1", port: "7890" });

export class EdgeGptService {
  public async getResponse(msg: Message): Promise<any> {
    let requestBody = {
      messages: [{ role: "user", content: msg.text().slice(msg.text().indexOf('@问问神奇的可莉吧 ') + 11) }]
    }
    axios.post('http://10.0.10.6:55059/api/edgegpt/chat', requestBody).then(
      async res => {
        console.log(res);
        try {
          if (res.data) {
            let reply = (res.data.text + '').replace('Bing', '可莉').replace('必应', '可莉')
            msg.say(reply);
            if (res.data.sourceAttributions) {
              if (res.data.sourceAttributions.length > 0) {
                await sleep(1000);
                let attrmsg = `引用文献：\n`;
                res.data.sourceAttributions.forEach((attr, index) => {
                  attrmsg += `\n[${index + 1}]：${attr['providerDisplayName'] || '未知'}：${attr['seeMoreUrl']}`
                });
                msg.say(attrmsg + '')
              }
            }
          }
        } catch (error) {
          msg.say('可莉不知道哦')
          console.log(error);
        }
      }
    ).catch(
      err => {
        msg.say('可莉不知道哦')
        console.log(err);
      }
    )
  }

  public async getPainting(msg: Message): Promise<any> {
    let requestBody = {
      description: msg.text().slice(msg.text().indexOf('/ai ') + 4)
    }
    axios.post('http://10.0.10.6:55059/api/edgegpt/image', requestBody).then(
      res => {
        // console.log(res);
        try {
          if (res.data) {
            if (res.data.bing_imgs && res.data.bing_imgs.length > 0) {
              res.data.bing_imgs.forEach(async (img, index) => {
                await sleep(1000);
                const b64String = img;
                const fileBox = FileBox.fromBase64(b64String)
                await fileBox.toFile(`ai${index}.jpg`, true).then(
                  res => {
                    msg.say(FileBox.fromFile(`ai${index}.jpg`));
                  }
                ).catch(
                  err => {
                    throw new Error("储存图片失败");
                  }
                )
              });
            }
          }
        } catch (error) {
          msg.say('可莉不会画哦')
          console.log(error);
        }
      }
    ).catch(
      err => {
        msg.say('可莉不会画哦')
        console.log(err);
      }
    )
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}