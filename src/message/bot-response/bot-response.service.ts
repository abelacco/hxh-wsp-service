import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';
import { STEPS } from 'src/config/constants';

@Injectable()
export class BotResponseService {

     buildMessage(messageClient: any) {
        console.log("BOT RESPONSE SERVICE BUILD MESSAGE", messageClient)
        const step = messageClient.message.step;
        const phone = messageClient.message.phone;
        const type = messageClient.responseClient?.type;
        console.log("BOT RESPONSE SERVICE BUILD MESSAGE TYPE", type)
        if(step && step === STEPS.SELECT_SPECIALTY)  {
            const buildMessage = Templates.generateTextResponseStep1(type, phone);
            return buildMessage;
        }
        else if(step && step === STEPS.INSERT_DATE) {
            const buildMessage = Templates.generateInfoDoctor(type, phone);
            return buildMessage;
        }
        else if(step && step === STEPS.SELECT_DOCTOR) {
            const buildMessage = Templates.generatePaymentOptions(type, phone);
            return buildMessage;
        }
        else if(step && step === STEPS.SELECT_PAYMENT) {
             const buildMessage = Templates.generateTextAccount(type, phone);
             return buildMessage;
   
        }
        else if(step && step === STEPS.SUBMIT_VOUCHER) {
            const buildMessage = Templates.confirmationPayment(type, phone);
            return buildMessage;
        } else {
            const buildMessage = Templates.generateSpecialitiesList(null, phone);
            return buildMessage;
        }
        // const buildMessage = Templates.generateInfoDoctor(null, messageClient.phone);
        // return buildMessage;
    }
}
