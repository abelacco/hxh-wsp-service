import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';
import { STEPS } from 'src/config/constants';
import { Message } from '../entities/message.entity';

@Injectable()
export class BotResponseService {
  buildMessage(messageClient: Message) {
    // necesito recibir el mensaje(la info para llenar los template)
    // switch para busacr el template que le correponde
    console.log('generando respuesta para', messageClient);
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
        return Templates.confirmationPayment(phone);
      default:
        return Templates.defaultMessageTemplate(phone);
    }
  }

  buildDoctorNotification(
    doctorPhone: string,
    messageId: string,
    patientName: string,
    date: string,
  ) {
    return Templates.doctorNotification(
      doctorPhone,
      messageId,
      patientName,
      date,
    );
  }
}
