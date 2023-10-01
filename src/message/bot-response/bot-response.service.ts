import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';

@Injectable()
export class BotResponseService {

     buildMessage(messageClient: any) {
        console.log("BOT RESPONSE SERVICE BUILD MESSAGE", messageClient)
        const phone = messageClient.message.phone;
        const type = messageClient.responseClient?.type;
        console.log("BOT RESPONSE SERVICE BUILD MESSAGE TYPE", type)
        if(type && type === 'list_reply') {
            const buildMessage = Templates.generateTextResponseStep1(type, phone);
            return buildMessage;
        }
        const buildMessage = Templates.generateSpecialitiesList(null, phone);
        return buildMessage;
    }
}
