import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';

@Injectable()
export class BotResponseService {

     buildMessage(botResponse: any) {
        const buildMessage = Templates.generateSpecialitiesList(null, botResponse.phone);
        return buildMessage;
    }
}
