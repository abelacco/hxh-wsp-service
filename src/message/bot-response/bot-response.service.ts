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
    const doctor = messageClient.doctor;
    const date = messageClient.date;
    const fee = messageClient.fee;
    switch (step) {
      case STEPS.SELECT_SPECIALTY:
        return Templates.generateSpecialitiesList(phone);
      case STEPS.INSERT_DATE:
        return Templates.dateStepTemplateMessage(phone);
      case STEPS.SELECT_DOCTOR:
        return Templates.generateInfoDoctor(phone, doctor, date, fee);
      case STEPS.SELECT_PAYMENT:
        return Templates.generatePaymentOptions(phone);
      case STEPS.SUBMIT_VOUCHER:
        return Templates.generateTextAccount(phone);
      case STEPS.SEND_CONFIRMATION:
        return Templates.verifyingVoucherTemplate(phone);
      default:
        return Templates.defaultMessageTemplate(phone);
    }
  }


  buildDoctorNotification(doctorPhone: string, messageId: string, patientName: string, date: string) {
    /*
      Build a doctor response template
    */
    return Templates.doctorNotification(doctorPhone, messageId, patientName, date);
  
  }

  buildConfirmationNotification(phone: string) {
    /*
      Build confirmation notification template
    */
    return Templates.confirmationPayment(phone);
  
  }

}
