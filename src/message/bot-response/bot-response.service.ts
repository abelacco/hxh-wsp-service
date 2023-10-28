import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';
import { STEPS } from 'src/config/constants';
import { Message } from '../entities/message.entity';
import { DoctorService } from 'src/doctor/doctor.service';
import { NotificationService } from 'src/notification/notification.service';
import { dateToString } from '../helpers/dateParser';

@Injectable()
export class BotResponseService {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly notificationManager: NotificationService,
  ) {}
  buildMessage(messageClient: Message) {

    /*
      Create a template according to the step
    */

    const step = messageClient.step;
    const phone = messageClient.phone;
    const doctor = messageClient.doctor;
    const stringDate = dateToString(messageClient.date);
    const fee = messageClient.fee;
    switch (step) {
      case STEPS.SELECT_SPECIALTY:
        return Templates.generateSpecialitiesList(phone);
      case STEPS.INSERT_DATE:
        return Templates.dateStepTemplateMessage(phone);
      case STEPS.SELECT_DOCTOR:
        return Templates.generateInfoDoctor(phone, doctor, stringDate, fee);
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


  async buildDoctorNotification(message: Message) {
    /*
      Build a doctor response template
    */
    const {id, clientName, date, speciality} = message
    const stringDate = dateToString(date)
    const doctors = await this.doctorService.getDoctors(speciality)
    for (const doc of doctors) {
      const notification = Templates.doctorNotification(doc.phone, id, clientName, stringDate);
      this.notificationManager.sendNotification(notification);
    }
  }

  searchingDoctorTemplateBuilder(phone: string) {
    return Templates.notifyingDoctorsTemplate(phone);
  }

  buildConfirmationNotification(date: Date, phone: string) {
    /*
      Build confirmation notification template
    */
    return Templates.confirmationPayment(phone, date);
  
  }

  buildRejectionNotification(date: Date, phone: string) {
    /*
      Build confirmation notification template
    */
    return Templates.rejectionPayment(phone, date);
  
  }

}
