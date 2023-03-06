import { Message } from 'wechaty';
import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';

export class OpenAIService {
  public async getResponse(msg: Message): Promise<any> {
    let configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    let openai = new OpenAIApi(configuration);

    let completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: msg.text() }],
    });
    let answer = completion.data.choices[0].message?.content;
    console.log(answer);

    msg.say(answer + '');
  }
}
