import { Injectable } from '@nestjs/common';
import { WspQueriesDto } from './dto/queries-webhook';
import { BotResponseService } from 'src/message/bot-response/bot-response.service';
import { MessageService } from 'src/message/message.service';

@Injectable()
export class WspService {

  constructor(
    private botResponse: BotResponseService,
    private msgService: MessageService

  ) {}
  proccessMessage(messageWSP: any) {
    // preguntar si es un mensaje ´valido
    console.log(JSON.stringify(messageWSP));
    const response = this.msgService.proccessMessage(messageWSP);
    this.sendMessages(response);
    return 'This action adds a new wsp';
  }

  validateWebHook(wspQueries: WspQueriesDto) {

    const myVerifyToken = process.env.MY_VERIFY_TOKEN;
    const hubMode = wspQueries['hub.mode'];
    const challenge = wspQueries['hub.challenge'];
    const verifyToken = wspQueries['hub.verify_token'];
    console.log(myVerifyToken);

    if (hubMode === 'subscribe' && verifyToken === myVerifyToken) {
      return challenge;
    } else {
      throw new Error('Failed validation. Make sure the validation tokens match.');
    }
  }

  async sendMessages(botResponse: any) {
    const buildMessage = this.botResponse.buildMessage(botResponse);
    // botResponse = '{ \"messaging_product\": \"whatsapp\", \"to\": \"51947308823\", \"type\": \"template\", \"template\": { \"name\": \"hello_world\", \"language\": { \"code\": \"en_US\" } } }'
    console.log(buildMessage);
    try {
        const response = await fetch(`https://graph.facebook.com/v16.0/${process.env.PHONE_ID}/messages`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`
          },
          body: JSON.stringify(buildMessage),
      });
      console.log(response);
      return response
        
      } catch (error) {
        throw new Error(error);
      }
  }


}
