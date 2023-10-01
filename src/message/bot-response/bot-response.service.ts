import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';

@Injectable()
export class BotResponseService {

     buildMessage(botResponse: any) {
        const buildMessage = Templates.generateInfoDoctor(botResponse.message, botResponse.phone);
        return buildMessage;
    }
}
