import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';

@Injectable()
export class BotResponseService {

     buildMessage(messageClient: any) {
        const phone = messageClient.message.phone;
        const type = messageClient.responseClient.type;

        if(type.type === 'list_reply') {
            const buildMessage = Templates.generateTextResponseStep1(type.options, phone);
            return buildMessage;
        }
        const buildMessage = Templates.generateSpecialitiesList(null, messageClient.phone);
        return buildMessage;
    }
}
