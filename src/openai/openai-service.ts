import { Message, log } from 'wechaty';
// import OpenAI from 'openai';
import axios from 'axios';
// import HttpsProxyAgent from 'https-proxy-agent';

// const httpsAgent = HttpsProxyAgent({ host: "127.0.0.1", port: "7890" });

export class OpenAIService {
  private config = {
    headers: {
      'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`
    }
  }
  private history = [{ "role": "system", "content": "你是可莉，英文是Klee，来自蒙德，是西风骑士团的火花骑士，你更擅长中文和英文的对话。你会为用户提供准确的回答。" }];
  private previousMsg = '';

  public async getResponse(msg: Message, botName: string): Promise<void> {
    const userContent = msg.text();
    let formattedUserContent = userContent.slice(botName.length);
    if (this.previousMsg !== formattedUserContent) {
      this.history = this.history.concat([{ role: 'user', content: formattedUserContent }]);
      this.previousMsg = formattedUserContent;
    }

    const requestBody = {
      model: 'moonshot-v1-8k',
      messages: this.history,
      temperature: 0.3,
    }

    try {
      const response = await axios.post('https://api.moonshot.cn/v1/chat/completions', requestBody, this.config)
      console.log(response);
      this.history = this.history.concat(response.data.choices[0].message)
      const reply = (response.data.choices[0].message.content + '').replaceAll('\n\n', '\n');
      msg.say(reply);
      if (this.history.length > 6) {
        this.history.splice(1, 1);
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        msg.say('Sorry, ' + error.response.statusText);
      } else if (error.error) {
        msg.say(error.error.type);
      }
    }
  }
}
