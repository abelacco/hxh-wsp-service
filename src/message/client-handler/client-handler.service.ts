import { BadRequestException, Injectable } from '@nestjs/common';
import { IParsedMessage } from 'src/wsp/entities/parsedMessage';
import { Message } from '../entities/message.entity';
import { clientHasDni, hasSpecificContentId, hasSpecificTitle, isInteractiveMessage, isResetMessage, isTextMessage, receivedMessageValidator } from '../helpers/receivedMessageValidator';
import { STEPS } from 'src/message/helpers/constants';
import { ID, SPECIAL_WORDS, WSP_MESSAGE_TYPES } from 'src/message/helpers/constants';
import { IMessageDao } from '../db/messageDao';
import { MongoDbService } from '../db/mongodb.service';
import { BotResponseService } from '../bot-response/bot-response.service';
import { parseDateInput, stringToDate } from '../helpers/dateParser';
import { dateValidator } from '../helpers/dateValidator';
import { messageErrorHandler } from '../helpers/messageErrorHandler';
import { ProviderService } from 'src/general-services/provider.service';
import { NotificationService } from 'src/notification/notification.service';
import { ClientsService } from 'src/general-services/clients.service';
import { AppointmentService } from 'src/general-services/appointment.service';
import { CommonsService } from 'src/general-services/commons.service';

@Injectable()
export class ClientHandlerService {

    private readonly _db: IMessageDao;

    constructor(
        // @InjectModel(Message.name)
        private readonly messageBuilder: BotResponseService,
        private readonly _mongoDbService: MongoDbService,
        private readonly providerService: ProviderService,
        private readonly notificationService: NotificationService,
        private readonly clientsService: ClientsService,
        private readonly appointmentService: AppointmentService,
        private readonly commonsService: CommonsService,


    ) {
        this._db = this._mongoDbService;
    }

    // entryMessage -> mensaje que llega desde whatsapp
    // findMessage -> mensaje que se encuentra en la base de datos

    async handleClientMessage(entryMessage: IParsedMessage, findMessage: Message): Promise<any[]> {

        if (isResetMessage(entryMessage)) {
            this.handleResetMessage(findMessage);
        }

        if (!this.isValidStep(findMessage.step, entryMessage)) {
            return this.handleInvalidStep(findMessage);
        }
        return this.processStepBasedOnMessage(entryMessage, findMessage);

    }


    private async handleResetMessage(findMessage: Message): Promise<any> {
        const resetedMessage = []
        return resetedMessage.push(this.updateAndBuildClientMessage(this.resetMessage(findMessage)))
    }

    private isValidStep(currentStep: string, entryMessage: IParsedMessage): boolean {
        // Implementa aquí la lógica para validar el paso del mensaje
        return receivedMessageValidator(currentStep, entryMessage);
    }

    private async handleInvalidStep(currentMessage: Message): Promise<any[]> {
        let buildedMessages = [];
        // Implementa la lógica para manejar un paso inválido
        currentMessage.attempts++;
        await this._mongoDbService.updateMessage(currentMessage.id, currentMessage);
        const errorMessage = messageErrorHandler(currentMessage);
        buildedMessages.push(...errorMessage);
        return buildedMessages;
    }

    private async processStepBasedOnMessage(entryMessage: IParsedMessage, findMessage: Message) {
        const buildedMessages = [];
        try {
            switch (findMessage.step) {
                case STEPS.INIT:
                    await this.handleInitStep(findMessage, buildedMessages);
                    break;
                case STEPS.SEND_GREETINGS:
                    await this.handleSendGreetingsStep(entryMessage, findMessage, buildedMessages);
                    break;
                case STEPS.PUT_DNI:
                    await this.handlePutDniStep(entryMessage, findMessage, buildedMessages);
                    break;
                case STEPS.INSERT_DATE:
                    await this.handleInsertDateStep(entryMessage, findMessage, buildedMessages);
                    break;
                case STEPS.SELECT_PROVIDER:
                    await this.handleSelectProviderStep(entryMessage, findMessage, buildedMessages);
                    break;
                case STEPS.SELECT_PAYMENT:
                    await this.handleSelectPaymentStep(findMessage, buildedMessages);
                    break;
                case STEPS.SUBMIT_VOUCHER:
                    await this.handleSubmitVoucherStep(entryMessage, findMessage, buildedMessages);
                    break;
                default:
                    buildedMessages.push(
                        this.messageBuilder.buildDefaultTemplate(entryMessage.clientPhone),
                    );
            }
        }
        catch (error) {
            this.handleErrorSystem(buildedMessages, entryMessage, findMessage, error);
        }

        return buildedMessages;
    }

    private async handleInitStep(findMessage: Message, buildedMessages: any[]): Promise<void> {
        findMessage.step = STEPS.SEND_GREETINGS;
        const message = await this.updateAndBuildClientMessage(findMessage);
        buildedMessages.push(message);
    }

    private async handleSendGreetingsStep(entryMessage: IParsedMessage, findMessage: Message, buildedMessages: any[]): Promise<void> {
        if (!clientHasDni(findMessage)) {
            findMessage.step = STEPS.PUT_DNI;
        } else if (hasSpecificContentId(entryMessage, ID.FIND_PROVIDER)) {
            findMessage.step = STEPS.INSERT_DATE;
        } else {
            findMessage.step = STEPS.INFO_FOR_NEW_PROVIDER;
        }
        const message = await this.updateAndBuildClientMessage(findMessage);
        buildedMessages.push(message);
    }

    private async handlePutDniStep(entryMessage: IParsedMessage, findMessage: Message, buildedMessages: any[]): Promise<void> {
        let registerDni = '';
        if (isInteractiveMessage(entryMessage) && hasSpecificContentId(entryMessage, ID.ACCEPT_DNI)) {
            findMessage.step = STEPS.INSERT_DATE;
            await this.clientsService.updateClient(findMessage.clientId, { dni: findMessage.dni, name: findMessage.clientName });
        } else if (isInteractiveMessage(entryMessage) && hasSpecificContentId(entryMessage, ID.RETRY_DNI)) {
            buildedMessages.push(this.messageBuilder.buildMessage(findMessage));
            return;
        } else {
            registerDni = await this.commonsService.registerDni(entryMessage.content);
            findMessage.dni = entryMessage.content;
            findMessage.clientName = registerDni;
        }

        await this._mongoDbService.updateMessage(findMessage.id, findMessage);
        const buildConfirmationTemplate = this.messageBuilder.buildDniConfirmationMessage(entryMessage.clientPhone, registerDni);
        buildedMessages.push(buildConfirmationTemplate);
    }

    private async handleInsertDateStep(entryMessage: IParsedMessage, findMessage: Message, buildedMessages: any[]): Promise<void> {
        if (isInteractiveMessage(entryMessage) && hasSpecificContentId(entryMessage, ID.ACCEPT_DATE)) {
            findMessage.step = STEPS.SELECT_PROVIDER;
            this.notifyProviders(findMessage);
        } else if (isInteractiveMessage(entryMessage) && hasSpecificContentId(entryMessage, ID.CHOOSE_ANOTHER)) {
            buildedMessages.push(this.messageBuilder.buildMessage(findMessage));
            return;
        } else {
            const dateParsed = parseDateInput(entryMessage.content);
            if (dateParsed.includes('NO_DATE') || !dateValidator(dateParsed)) {
                throw new BadRequestException('FECHA NO VÁLIDA');
            }
            findMessage.date = stringToDate(dateParsed);
        }

        await this._mongoDbService.updateMessage(findMessage.id, findMessage);
        const dateConfirmationMessage = this.messageBuilder.dateConfirmationTemplate(entryMessage.clientPhone, findMessage.date);
        buildedMessages.push(dateConfirmationMessage);
    }

    private async handleSelectProviderStep(entryMessage: IParsedMessage, findMessage: Message, buildedMessages: any[]): Promise<void> {
        if (entryMessage.content.id === ID.ACEPT_PROVIDER) {
            findMessage.step = STEPS.SELECT_PAYMENT;
        } else if (entryMessage.content.id === ID.CHOOSE_ANOTHER) {
            return;
        } else {
            const provider = await this.providerService.findById(entryMessage.content.id);
            findMessage.providerPhone = provider.phone;
            findMessage.providerId = provider._id;
            findMessage.fee = provider.fee;
            const appointment = await this.appointmentService.createAppointment(findMessage);
            findMessage.appointmentId = appointment._id;
            const provConfirmationMessage = this.messageBuilder.providerConfirmationTemplate(provider.name, findMessage);
            buildedMessages.push(provConfirmationMessage);
        }

        const message = await this.updateAndBuildClientMessage(findMessage);
        buildedMessages.push(message);
    }

    private async handleSelectPaymentStep(findMessage: Message, buildedMessages: any[]): Promise<void> {
        findMessage.step = STEPS.SUBMIT_VOUCHER;
        const message = await this.updateAndBuildClientMessage(findMessage);
        buildedMessages.push(message);
    }

    private async handleSubmitVoucherStep(entryMessage: IParsedMessage, findMessage: Message, buildedMessages: any[]): Promise<void> {
        findMessage.step = STEPS.SEND_CONFIRMATION;
        const waitingMessage = await this.updateAndBuildClientMessage(findMessage);
        buildedMessages.push(waitingMessage);

        const voucher = await this.sendVoucherImage(entryMessage.content, findMessage);
        await this.appointmentService.updateAppointment(findMessage.appointmentId, voucher);
    }


    private handleErrorSystem(buildedMessages: any[], entryMessage: IParsedMessage, findMessage: Message, error: any) {
        console.error("Error processing message step:", error);
        // Puedes manejar diferentes tipos de errores aquí
        return [this.messageBuilder.buildDefaultErrorSystemTemplate(findMessage.clientPhone)];
    }


    async updateAndBuildClientMessage(message: Message) {
        // Actualiza el mensaje en la base de datos con el nuevo paso
        await this._mongoDbService.updateMessage(message.id, message);
        // Construye el mensaje que corresponde segun el nuevo paso actualizado
        return this.messageBuilder.buildMessage(message);
    }

    async sendVoucherImage(imageUrl: string, message: Message) {
        try {

            const uploadResponse = await this.commonsService.uploadImage(imageUrl);
            message.imageVoucher = uploadResponse;
            await this._mongoDbService.updateMessage(message.id, message);
            return uploadResponse;
        } catch (error) {
            console.error('Error al obtener la imagen:', error);
            throw error;
        }
    }

    async notifyProviders(message: Message) {
        const messages = await this.messageBuilder.buildProviderNotification(message);
        for (const message of messages) {
            await this.notificationService.sendNotification(message);
        }
    }

    resetMessage(message: Message) {
        message.step = STEPS.SEND_GREETINGS;
        message.attempts = 0;
        message.providerId = '';
        message.providerPhone = '';
        message.date = null;

        return message;
    }

}


// private async processStepBasedOnMessage(entryMessage: IParsedMessage, findMessage: Message) {
//     const buildedMessages = [];
//     try {
//         switch (findMessage.step) {
//             /*
//               Handle what message template would be returned
//               according to the step
//             */
//             case STEPS.INIT:
//                 try {
//                     // Actualizar el paso y lo actualizas en la base de datos , despues construyes el mensaje de respuesta
//                     findMessage.step = STEPS.SEND_GREETINGS;
//                     // await this._mongoDbService.updateMessage(findMessage.id, findMessage);
//                     buildedMessages.push(await this.updateAndBuildClientMessage(findMessage));
//                 } catch {
//                     findMessage.attempts++;
//                     this._mongoDbService.updateMessage(findMessage.id, findMessage);
//                     const errorResponse = this.errorResponseHandler(
//                         entryMessage.clientPhone,
//                     );
//                     buildedMessages.push(errorResponse);
//                 }
//                 break;
//             case STEPS.SEND_GREETINGS:
//                 try {
//                     // preguntar si el cliente tienen dni
//                     if (!clientHasDni(findMessage)) {
//                         // Actualiza el paso del mensaje
//                         findMessage.step = STEPS.PUT_DNI;
//                         // Actualizas el mensaje en la base de datos y ademas construyes el mensaje de respuesta
//                         buildedMessages.push(
//                             await this.updateAndBuildClientMessage(findMessage),
//                         );
//                         return buildedMessages;
//                     } else {
//                         if (hasSpecificContentId(entryMessage, ID.FIND_PROVIDER)) {
//                             findMessage.step = STEPS.INSERT_DATE;
//                             buildedMessages.push(
//                                 await this.updateAndBuildClientMessage(findMessage),
//                             );
//                             return buildedMessages;
//                         } else {
//                             findMessage.step = STEPS.INFO_FOR_NEW_PROVIDER;
//                             buildedMessages.push(
//                                 await this.updateAndBuildClientMessage(findMessage),
//                             );
//                             return buildedMessages;
//                         }
//                     }

//                 } catch (error) {

//                 }
//                 break;
//             case STEPS.PUT_DNI:
//                 try {
//                     // {poi532qcepta que nombre y apellido coinciden con el dni
//                     if (
//                         isInteractiveMessage(entryMessage) &&
//                         hasSpecificContentId(entryMessage, ID.ACCEPT_DNI)
//                     ) {
//                         // Actualiza el paso del mensaje
//                         findMessage.step = STEPS.INSERT_DATE;
//                         await this.clientsService.updateClient(findMessage.clientId, { dni: findMessage.dni, name: findMessage.clientName });
//                         // Actualizas el mensaje en la base de datos y ademas construyes el mensaje de respuesta
//                         buildedMessages.push(
//                             await this.updateAndBuildClientMessage(findMessage),
//                         );
//                         return buildedMessages;
//                     }
//                     // Rechaza que nombre y apellido no coinciden con el dni
//                     if (
//                         isInteractiveMessage(entryMessage) &&
//                         hasSpecificContentId(entryMessage, ID.RETRY_DNI)
//                     ) {
//                         buildedMessages.push(
//                             this.messageBuilder.buildMessage(findMessage),
//                         );
//                         return buildedMessages;
//                     }

//                     const registerDni = await this.commonsService.registerDni(entryMessage.content);
//                     findMessage.dni = entryMessage.content;
//                     findMessage.clientName = registerDni;
//                     await this._mongoDbService.updateMessage(findMessage.id, findMessage);
//                     buildedMessages.push(
//                         this.messageBuilder.buildDniConfirmationMessage(
//                             entryMessage.clientPhone,
//                             registerDni
//                         ),
//                     );

//                     break;
//                 } catch {
//                     findMessage.attempts++;
//                     this._mongoDbService.updateMessage(findMessage.id, findMessage);
//                     if (entryMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE) {
//                         const errorMessage = this.messageBuilder.buildDefaultTemplate(entryMessage.clientPhone);
//                         buildedMessages.push(errorMessage);
//                     } else {
//                         const errorMessage = messageErrorHandler(findMessage);
//                         buildedMessages.push(...errorMessage);
//                     }
//                 }
//                 break;
//             case STEPS.INSERT_DATE:
//                 try {

//                     if (
//                         isInteractiveMessage(entryMessage) &&
//                         hasSpecificContentId(entryMessage, ID.ACCEPT_DATE)
//                     ) {
//                         findMessage.step = STEPS.SELECT_PROVIDER;
//                         await this._mongoDbService.updateMessage(findMessage.id, findMessage);
//                         const ClientMessage =
//                             this.messageBuilder.searchingProviderTemplateBuilder(
//                                 entryMessage.clientPhone,
//                             );
//                         buildedMessages.push(ClientMessage);
//                         this.notifyProviders(findMessage);
//                         return buildedMessages;
//                     }

//                     if (
//                         isInteractiveMessage(entryMessage) &&
//                         hasSpecificContentId(entryMessage, ID.CHOOSE_ANOTHER)
//                     ) {
//                         buildedMessages.push(this.messageBuilder.buildMessage(findMessage));
//                         return buildedMessages;
//                     }

//                     const dateParsed = parseDateInput(
//                         entryMessage.content,
//                     );
//                     if (
//                         dateParsed.includes('NO_DATE') ||
//                         !dateValidator(dateParsed)
//                     ) {
//                         console.log('FECHA NO VÁLIDA');
//                         throw new BadRequestException();

//                     }
//                     findMessage.date = stringToDate(dateParsed);
//                     await this._mongoDbService.updateMessage(findMessage.id, findMessage);
//                     const dateConfirmationMessage =
//                         this.messageBuilder.dateConfirmationTemplate(
//                             entryMessage.clientPhone,
//                             findMessage.date,
//                         );
//                     console.log('dateConfirmationMessage', dateConfirmationMessage);
//                     buildedMessages.push(dateConfirmationMessage);
//                 } catch (error) {
//                     console.log("error", error);
//                     findMessage.attempts++;
//                     this._mongoDbService.updateMessage(findMessage.id, findMessage);
//                     const errorResponse = this.errorResponseHandler(
//                         entryMessage.clientPhone,
//                     );
//                     buildedMessages.push(errorResponse);
//                 }
//                 break;
//             case STEPS.SELECT_PROVIDER:
//                 try {
//                     if (
//                         entryMessage.content.id &&
//                         entryMessage.content.id === ID.ACEPT_PROVIDER
//                     ) {
//                         findMessage.step = STEPS.SELECT_PAYMENT;
//                         buildedMessages.push(
//                             await this.updateAndBuildClientMessage(findMessage),
//                         );
//                         return buildedMessages;
//                     }

//                     if (
//                         entryMessage.content.id &&
//                         entryMessage.content.id === ID.CHOOSE_ANOTHER
//                     ) {
//                         return;
//                     }

//                     const provider = await this.providerService.findById(
//                         entryMessage.content.id,
//                     );
//                     findMessage.providerPhone = provider.phone;
//                     findMessage.providerId = provider._id;
//                     findMessage.fee = provider.fee;
//                     const appointment = await this.appointmentService.createAppointment(findMessage);
//                     findMessage.appointmentId = appointment._id;
//                     await this._mongoDbService.updateMessage(findMessage.id, findMessage);
//                     const provConfirmationMessage =
//                         this.messageBuilder.providerConfirmationTemplate(
//                             provider.name,
//                             findMessage,
//                         );
//                     buildedMessages.push(provConfirmationMessage);
//                 } catch {
//                     findMessage.attempts++;
//                     this._mongoDbService.updateMessage(findMessage.id, findMessage);
//                     const errorResponse = this.errorResponseHandler(
//                         entryMessage.clientPhone,
//                     );
//                     buildedMessages.push(errorResponse);
//                 }
//                 break;
//             case STEPS.SELECT_PAYMENT:
//                 try {
//                     findMessage.step = STEPS.SUBMIT_VOUCHER;
//                     buildedMessages.push(
//                         await this.updateAndBuildClientMessage(findMessage),
//                     );
//                 } catch {
//                     findMessage.attempts++;
//                     this._mongoDbService.updateMessage(findMessage.id, findMessage);
//                     const errorResponse = this.errorResponseHandler(
//                         entryMessage.clientPhone,
//                     );
//                     buildedMessages.push(errorResponse);
//                 }
//                 break;
//             case STEPS.SUBMIT_VOUCHER:
//                 try {
//                     findMessage.step = STEPS.SEND_CONFIRMATION;
//                     const waitingMessage = await this.updateAndBuildClientMessage(
//                         findMessage,
//                     );
//                     buildedMessages.push(waitingMessage);
//                     const voucher = await this.sendVoucherImage(
//                         entryMessage.content,
//                         findMessage,
//                     );
//                     await this.appointmentService.updateAppointment(findMessage.appointmentId, voucher);
//                 } catch {
//                     findMessage.attempts++;
//                     this._mongoDbService.updateMessage(findMessage.id, findMessage);
//                     const errorResponse = this.errorResponseHandler(
//                         entryMessage.clientPhone,
//                     );
//                     buildedMessages.push(errorResponse);
//                 }
//                 break;
//             default:
//                 buildedMessages.push(
//                     this.messageBuilder.buildDefaultTemplate(entryMessage.clientPhone),
//                 );
//         }
//     }
//     catch (error) {
//         this.handleErrorSystem(buildedMessages, entryMessage, findMessage, error);
//     }

//     return buildedMessages;
// }