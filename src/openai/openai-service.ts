import { Message } from 'wechaty';
import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';
import HttpsProxyAgent from 'https-proxy-agent';

const httpsAgent = HttpsProxyAgent({ host: "127.0.0.1", port: "7890" });

export class OpenAIService {
  // private configuration = new Configuration({
  //   apiKey: 'process.env.OPENAI_API_KEY',
  // });
  // private openai = new OpenAIApi(this.configuration);

  public async getResponse(msg: Message): Promise<any> {
    // let completion = await this.openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   messages: [{ role: "user", content: msg.text() }],
    // });
    // let answer = await completion.data.choices[0].message?.content;
    // console.log(answer);

    // await msg.say(answer + '');
    let config = {
      headers: {
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      }
    }
    let requestBody = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: msg.text().slice(msg.text().indexOf('@问问神奇的可莉吧 ') + 11) }]
    }
    // axios.create({httpsAgent}).post('https://api.openai.com/v1/chat/completions', requestBody, config).then(
    axios.post('https://api.openai.com/v1/chat/completions', requestBody, config).then(
      res => {
        try {
          console.log(res);
          // msg.say(res.data.choices[0].message);
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
