import { Message } from 'wechaty';
import axios from 'axios';

// const httpsAgent = HttpsProxyAgent({ host: "127.0.0.1", port: "7890" });

export class EdgeGptService {
  public async getResponse(msg: Message): Promise<any> {
    let requestBody = {
      messages: [{ role: "user", content: msg.text().slice(msg.text().indexOf('必应@问问神奇的可莉吧 ') + 13) }]
    }
    axios.post('http://localhost:55059/api/edgegpt/chat', requestBody).then(
      res => {
        console.log(res);
        try {
          if (res.data) {
            msg.say(res.data.text + '');
            if (res.data.sourceAttributions && res.data.sourceAttribution.length > 0) {
              let attrmsg = `引用文献：\n`;
              res.data.sourceAttribution.forEach((attr, index) => {
                attrmsg += `[${index + 1}]：${attr['providerDisplayName'] || '未知'}
                ${attr['seeMoreUrl']}`
              });
              msg.say(attrmsg + '')
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    ).catch(
      err => {
        console.log(err);
      }
    )
  }
}
