import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';
import { STEPS } from 'src/config/constants';
import { Message } from '../entities/message.entity';
import { ProviderService } from 'src/providers/provider.service';
import { dateToString } from '../helpers/dateParser';

@Injectable()
export class BotResponseService {
  constructor(
    private readonly providerService: ProviderService,
  ) { }
  buildMessage(messageClient: Message) {
    /*
      Create a template according to the step
    */
    // Aca ya recive que paso toca contestar
    const step = messageClient.step;
    const phone = messageClient.clientPhone;
    const provider = messageClient.providerId;
    const stringDate = dateToString(messageClient.date);
    const fee = messageClient.fee;
    switch (step) {
      case STEPS.INIT:
      case STEPS.SEND_GREETINGS:
        return this.buildIntroMessage(phone);
      case STEPS.PUT_DNI:
        return this.dniRequestMessage(phone);
      case STEPS.INSERT_DATE:
        return Templates.dateStepTemplateMessage(phone);
        // return this.buildIntroMessage(phone);

      // case STEPS.SELECT_PROVIDER:
      //   return Templates.generateSpecialitiesList(phone);
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

  async buildProviderCard(providerPhone: string, message: Message) {
    const provider = await this.providerService.findByPhone(
      providerPhone,
    );
    const clientPhone = message.clientPhone;
    const providerId = provider[0]._id;
    const fee = provider[0].fee;
    const stringDate = dateToString(message.date)
    const imageUrl = provider[0].imageUrl;
    return Templates.generateInfoProvider(clientPhone, providerId, stringDate, fee, imageUrl);
  }

  buildDniConfirmationMessage(phone: string, dniName: string) {
    return Templates.dniConfirmationTemplate(phone, dniName);
  }

  buildIntroMessage(phone: string) {
    return Templates.botIntroductionTemplate(phone);
  }

  dniRequestMessage(phone: string) {
    return Templates.askForDniTemplate(phone);
  }

  async buildProviderNotification(message: Message) {
    /*
      Build a Provider response template
    */
    const { id, clientName, date } = message;
    const stringDate = dateToString(date);
    const providers = await this.providerService.getAllProviders();
    const notifications = [];
    for (const pro of providers) {
      const notification = Templates.providerNotification(
        pro.phone,
        id,
        clientName,
        stringDate,
      );
      notifications.push(notification);
    }
    return notifications;
  }

  searchingProviderTemplateBuilder(phone: string) {
    return Templates.notifyingProviderTemplate(phone);
  }

  // providerConfirmationTemplate(phone: string, speciality: string) {
  //   return Templates.providerConfirmation(phone, speciality);
  // }

  providerLinkTemplate(phone: string) {
    return Templates.providersLinkMessage(phone);
  }

  providerConfirmationTemplate(docName: string, message: Message) {
    const { fee, date, clientPhone } = message;
    const stringDate = dateToString(date);
    return Templates.providerConfirmation(clientPhone, docName, fee, stringDate);
  }

  dateConfirmationTemplate(phone: string, date: Date) {
    const stringDate = dateToString(date);
    return Templates.dateConfirmation(phone, stringDate);
  }

  buildConfirmationTemplates(appointment: any) {
    /*
      Build confirmation notification template
    */
    return [Templates.providerConfirmationPayment(appointment), Templates.clientConfirmationPayment(appointment)];
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

  // buildMessageChatGTP(message: string, phone: string, specialistSelected?: string) {
  //   /*
  //     Build confirmation notification template
  //   */
  //   if (specialistSelected) {
  //     return Templates.generateChatGPToptions(message, phone, specialistSelected);
  //   }
  //   return Templates.generateTextChatGTP(message, phone);

  // }

}
