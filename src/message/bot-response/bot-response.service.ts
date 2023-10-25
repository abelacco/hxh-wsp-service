import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';
import { STEPS } from 'src/config/constants';
import { Message } from '../entities/message.entity';
import { DoctorService } from 'src/doctor/doctor.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class BotResponseService {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly notificationManager: NotificationsService,
  ) {}
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
        return Templates.confirmationPayment(phone);
      default:
        return Templates.defaultMessageTemplate(phone);
    }
  }


  async buildDoctorNotification(message: Message) {
    /*
      Build a doctor response template
    */
    const {id, clientName, date, speciality} = message
    const doctors = await this.doctorService.getDoctors(speciality)
    for (const doc of doctors) {
      const notification = Templates.doctorNotification(doc.phone, id, clientName, date);
      this.notificationManager.sendNotification(notification);
    }
  }

  searchingDoctorTemplateBuilder(phone: string) {
    return Templates.notifyingDoctorsTemplate(phone);
  }
}
