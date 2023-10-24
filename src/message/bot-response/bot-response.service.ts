import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';
import { STEPS } from 'src/config/constants';
import { Message } from '../entities/message.entity';

@Injectable()
export class BotResponseService {
  buildMessage(messageClient: Message) {
    /*
      Create a template according to the step
    */
    const step = messageClient.step;
    const phone = messageClient.phone;
    switch (step) {
      case STEPS.SELECT_SPECIALTY:
        return Templates.generateSpecialitiesList(phone);
      case STEPS.INSERT_DATE:
        return Templates.dateStepTemplateMessage(phone);
      case STEPS.SELECT_DOCTOR:
        return Templates.generateInfoDoctor(phone, messageClient.doctor);
      case STEPS.SELECT_PAYMENT:
        return Templates.generatePaymentOptions(phone);
      case STEPS.SUBMIT_VOUCHER:
        return Templates.generateTextAccount(phone);
      case STEPS.SEND_CONFIRMATION:
        return Templates.confirmationPayment(phone);
      default:
        return Templates.defaultMessageTemplate(phone);
    }
  }

  buildDoctorNotification(doctorPhone: string, messageId: string, patientName: string) {
    /*
      Build a doctor response template
    */
    return Templates.doctorNotification(doctorPhone, messageId, patientName);
  }
}
