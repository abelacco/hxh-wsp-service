import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';
import { STEPS } from 'src/config/constants';
import { Message } from '../entities/message.entity';
import { DoctorService } from 'src/doctor/doctor.service';
import { dateToString } from '../helpers/dateParser';

@Injectable()
export class BotResponseService {
  constructor(
    private readonly doctorService: DoctorService,
  ) {}
  buildMessage(messageClient: Message) {
    /*
      Create a template according to the step
    */

    const step = messageClient.step;
    const phone = messageClient.phone;
    const doctor = messageClient.doctorId;
    const stringDate = dateToString(messageClient.date);
    const fee = messageClient.fee;
    switch (step) {
      case STEPS.INIT:
        return this.buildIntroMessage(phone);
        case STEPS.PUT_DNI:
          return this.dniRequestMessage(phone);
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

  buildIntroMessage(phone: string) {
    return Templates.botIntroductionTemplate(phone);
  }

  dniRequestMessage(phone: string) {
    return Templates.askForDniTemplate(phone);
  }

  async buildDoctorNotification(message: Message) {
    /*
      Build a doctor response template
    */
    const { id, clientName, date, speciality } = message;
    const stringDate = dateToString(date);
    const doctors = await this.doctorService.getDoctors(speciality);
    const notifications = [];
    for (const doc of doctors) {
      const notification = Templates.doctorNotification(
        doc.phone,
        id,
        clientName,
        stringDate,
      );
      notifications.push(notification);
    }
    return notifications;
  }

  searchingDoctorTemplateBuilder(phone: string) {
    return Templates.notifyingDoctorsTemplate(phone);
  }

  specialityConfirmationTemplate(phone: string, speciality: string) {
    return Templates.specialityConfirmation(phone, speciality);
  }

  specialistLinkTemplate(phone: string) {
    return Templates.specialistsLinkMessage(phone);
  }

  doctorConfirmationTemplate(docName:string, message: Message) {
    const {fee, date, phone} = message;
    const stringDate = dateToString(date);
    return Templates.doctorConfirmation(phone, docName, fee, stringDate);
  }

  dateConfirmationTemplate(phone:string, date: Date) {
    const stringDate = dateToString(date);
    return Templates.dateConfirmation(phone, stringDate);
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
  buildDefaultTemplate(phone: string) {
    /*
      Build confirmation notification template
    */
    return Templates.defaultMessageTemplate(phone);
  }

  buildMessageChatGTP(message: string, phone: string , specialistSelected?: string) {
    /*
      Build confirmation notification template
    */
   if(specialistSelected) {
    return Templates.generateChatGPToptions(message, phone, specialistSelected);
   }
    return Templates.generateTextChatGTP(message, phone);
  
  }

}
