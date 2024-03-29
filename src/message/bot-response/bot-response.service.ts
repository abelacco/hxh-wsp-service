import { Injectable } from '@nestjs/common';
import { Templates } from '../helpers/templates/textTemplate';
import { STEPS } from 'src/message/helpers/constants';
import { Message } from '../entities/message.entity';
import { ProviderService } from 'src/general-services/provider.service';
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
    // const provider = messageClient.providerId;
    // const stringDate = dateToString(messageClient.date);
    // const fee = messageClient.fee;
    switch (step) {
      case STEPS.INIT:
      case STEPS.SEND_GREETINGS:
        return this.buildIntroMessage(phone);
      case STEPS.PUT_DNI:
        return this.dniRequestMessage(phone);
      case STEPS.INSERT_DATE:
        return Templates.dateStepTemplateMessage(phone);
      // case STEPS.SELECT_PROVIDER:
      //   return Templates.generateProvidersOptions(phone);
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
    const address = provider[0].address;
    return Templates.generateInfoProvider(clientPhone, providerId, stringDate, fee, imageUrl,address);
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
      const notification = Templates.providerNotificationTemplate(
        id,
        pro.phone,
        clientName,
        date,
      );
      notifications.push(notification);
    }
    return notifications;
  }

   buildStartConversationAdminNotification(message: Message)  {
    /*
      Build a Provider response template
    */
    const {clientPhone } = message;
    const ADMIN = ['51947308823', '51980827944', '51932662634'];
    const notifications = [];
    for (const ad of ADMIN) {
      const notification = Templates.clientStartConversation(
        clientPhone,
        ad,
      );
      notifications.push(notification);
    }
    return notifications;
  }

  buildPaymentAdminNotification(message: Message)  {
    /*
      Build a Provider response template
    */
    const {clientPhone , clientName } = message;
    const ADMIN = ['51947308823', '51980827944', '51932662634'];
    const notifications = [];
    for (const ad of ADMIN) {
      const notification = Templates.clientPaymentNotificationTemplate(
        clientName,
        clientPhone,
        ad,
      );
      notifications.push(notification);
    }
    return notifications;
  }

  searchingProviderTemplateBuilder(phone: string) {
    return Templates.notifyingProviderTemplate(phone);
  }



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

  buildDefaultErrorSystemTemplate(phone: string) {
    /*
      Build confirmation notification template
    */
    return Templates.defaultErrorSystemMessageTemplate(phone);
  }

  // providerConfirmationTemplate(phone: string, speciality: string) {
  //   return Templates.providerConfirmation(phone, speciality);
  // }

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
