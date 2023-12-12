import { BadRequestException, Injectable } from '@nestjs/common';
import { IParsedMessage } from 'src/wsp/entities/parsedMessage';
import { Message } from '../entities/message.entity';
import { clientHasDni, hasSpecificContentId, isInteractiveMessage, receivedMessageValidator } from '../helpers/receivedMessageValidator';
import { STEPS } from 'src/config/constants';
import { ID, WSP_MESSAGE_TYPES } from 'src/wsp/helpers/constants';
import axios from 'axios';
import { IMessageDao } from '../db/messageDao';
import { MongoDbService } from '../db/mongodb.service';
import { InjectModel } from '@nestjs/mongoose';
import { BotResponseService } from '../bot-response/bot-response.service';
import { parseDateInput, stringToDate } from '../helpers/dateParser';
import { dateValidator } from '../helpers/dateValidator';
import { messageErrorHandler } from '../helpers/messageErrorHandler';
import { ProviderService } from 'src/providers/provider.service';
import { createAppointment } from '../helpers/createAppointment';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class ClientHandlerService {

    private readonly _db: IMessageDao;

    constructor(
        // @InjectModel(Message.name)
        private readonly messageBuilder: BotResponseService,
        private readonly _mongoDbService: MongoDbService,
        private readonly providerService: ProviderService,
        private readonly notificationService: NotificationService,

    ) {
        this._db = this._mongoDbService;
    }


    private isValidStep(step: string, message: IParsedMessage): boolean {
        // Implementa aquí la lógica para validar el paso del mensaje
        return receivedMessageValidator(step, message);

    }

    async handleClientMessage(infoMessage: IParsedMessage, findMessage: Message): Promise<any[]> {
        const buildedMessages = [];

        if (!this.isValidStep(findMessage.step, infoMessage)) {
            // Manejo de un paso no válido
            // Puedes manejar esto aquí o llamar a otro método que se encargue de ello
            return this.handleInvalidStep(findMessage);
        }

        // Lógica para manejar el mensaje válido
        switch (findMessage.step) {
            /*
              Handle what message template would be returned
              according to the step
            */
            case STEPS.INIT:
                try {
                    // Actualizar el paso y lo actualizas en la base de datos , despues construyes el mensaje de respuesta
                    findMessage.step = STEPS.SEND_GREETINGS;
                    // await this._mongoDbService.updateMessage(findMessage.id, findMessage);
                    buildedMessages.push(await this.updateAndBuildClientMessage(findMessage));
                } catch {
                    findMessage.attempts++;
                    this._mongoDbService.updateMessage(findMessage.id, findMessage);
                    const errorResponse = this.errorResponseHandler(
                        infoMessage.clientPhone,
                    );
                    buildedMessages.push(errorResponse);
                }
                break;
            case STEPS.SEND_GREETINGS:
                try {
                    // preguntar si el cliente tienen dni
                    if(!clientHasDni(findMessage)) {
                        // Actualiza el paso del mensaje
                        findMessage.step = STEPS.PUT_DNI;
                        // Actualizas el mensaje en la base de datos y ademas construyes el mensaje de respuesta
                        buildedMessages.push(
                            await this.updateAndBuildClientMessage(findMessage),
                        );
                        return buildedMessages;
                    } else {
                        if(hasSpecificContentId(infoMessage, ID.FIND_PROVIDER)){
                            findMessage.step = STEPS.INSERT_DATE;
                            buildedMessages.push(
                                await this.updateAndBuildClientMessage(findMessage),
                            );
                            return buildedMessages;
                        } else {
                            findMessage.step = STEPS.INFO_FOR_NEW_PROVIDER;
                            buildedMessages.push(
                                await this.updateAndBuildClientMessage(findMessage),
                            );
                            return buildedMessages;
                        }
                    }
                    // ver la repuesta
                    // si es cuarto pasar al paso para preguntar la fecha
                    // si es proveedor pasar al paso para enviar informacion para afiliarse
                } catch (error) {
                    
                }
                break;
            case STEPS.PUT_DNI:
                try {
                    // {poi532qcepta que nombre y apellido coinciden con el dni
                    if (
                        isInteractiveMessage(infoMessage)&&
                        hasSpecificContentId(infoMessage,ID.ACCEPT_DNI)
                    ) {
                        // Actualiza el paso del mensaje
                        findMessage.step = STEPS.INSERT_DATE;
                        // // Actualizas el name y el dni en la base de datos de pacientes
                        // await axios.patch(
                        //     `${process.env.API_SERVICE}/client/${findMessage.clientId}`, { dni: findMessage.dni, name: findMessage.clientName },
                        // );
                        // Actualizas el mensaje en la base de datos y ademas construyes el mensaje de respuesta
                        buildedMessages.push(
                            await this.updateAndBuildClientMessage(findMessage),
                        );
                        return buildedMessages;
                    }
                    // Rechaza que nombre y apellido no coinciden con el dni
                    if (
                        isInteractiveMessage(infoMessage) &&
                        hasSpecificContentId(infoMessage,ID.RETRY_DNI)
                    ) {
                        buildedMessages.push(
                            this.messageBuilder.buildMessage(findMessage),
                        );
                        return buildedMessages;
                    }
                    //Cuando ingresan el dni se hace una consulta a la api de perú
                    const dniRequest = await axios.get(
                        `${process.env.API_SERVICE}/apiperu?idNumber=${infoMessage.content}`,
                    );
                    const dniResponse = dniRequest.data;
                    if (dniResponse.success === true) {
                        const dniName = `${dniResponse.nombres} ${dniResponse.apellidoPaterno} ${dniResponse.apellidoMaterno}`;
                        findMessage.dni = infoMessage.content;
                        findMessage.clientName = dniName;
                        await this._mongoDbService.updateMessage(findMessage.id, findMessage);
                        buildedMessages.push(
                            this.messageBuilder.buildDniConfirmationMessage(
                                infoMessage.clientPhone,
                                dniName
                            ),
                        );
                    } else {
                        throw new BadRequestException();
                    }
                    break;
                } catch {
                    findMessage.attempts++;
                    this._mongoDbService.updateMessage(findMessage.id, findMessage);
                    if (infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE) {
                        const errorMessage = this.messageBuilder.buildDefaultTemplate(infoMessage.clientPhone);
                        buildedMessages.push(errorMessage);
                    } else {
                        const errorMessage = messageErrorHandler(findMessage);
                        buildedMessages.push(...errorMessage);
                    }
                }
                break;
            case STEPS.INSERT_DATE:
                try {

                    if (
                        isInteractiveMessage(infoMessage) &&
                        hasSpecificContentId(infoMessage,ID.ACCEPT_DATE)
                    ) {
                        findMessage.step = STEPS.SELECT_PROVIDER;
                        await this._mongoDbService.updateMessage(findMessage.id, findMessage);
                        const ClientMessage =
                            this.messageBuilder.searchingProviderTemplateBuilder(
                                infoMessage.clientPhone,
                            );
                        buildedMessages.push(ClientMessage);
                        this.notifyProviders(findMessage);
                        return buildedMessages;
                    }

                    if (
                        isInteractiveMessage(infoMessage) &&
                        hasSpecificContentId(infoMessage,ID.CHOOSE_ANOTHER)
                    ) {
                        buildedMessages.push(this.messageBuilder.buildMessage(findMessage));
                        return buildedMessages;
                    }

                    const dateParsed = parseDateInput(
                        infoMessage.content,
                    );
                    if (
                        dateParsed.includes('NO_DATE') ||
                        !dateValidator(dateParsed)
                    ) {
                        console.log('FECHA NO VÁLIDA');
                        throw new BadRequestException();

                    }
                    findMessage.date = stringToDate(dateParsed);
                    await this._mongoDbService.updateMessage(findMessage.id, findMessage);
                    const dateConfirmationMessage =
                        this.messageBuilder.dateConfirmationTemplate(
                            infoMessage.clientPhone,
                            findMessage.date,
                        );
                    console.log('dateConfirmationMessage', dateConfirmationMessage);
                    buildedMessages.push(dateConfirmationMessage);
                } catch (error) {
                    console.log("error", error);
                    findMessage.attempts++;
                    this._mongoDbService.updateMessage(findMessage.id, findMessage);
                    const errorResponse = this.errorResponseHandler(
                        infoMessage.clientPhone,
                    );
                    buildedMessages.push(errorResponse);
                }
                break;
            case STEPS.SELECT_PROVIDER:
                try {
                    if (
                        infoMessage.content.id &&
                        infoMessage.content.id === ID.ACEPT_PROVIDER
                    ) {
                        findMessage.step = STEPS.SELECT_PAYMENT;
                        buildedMessages.push(
                            await this.updateAndBuildClientMessage(findMessage),
                        );
                        return buildedMessages;
                    }

                    if (
                        infoMessage.content.id &&
                        infoMessage.content.id === ID.CHOOSE_ANOTHER
                    ) {
                        return;
                    }

                    const provider = await this.providerService.findById(
                        infoMessage.content.id,
                    );
                    findMessage.providerPhone = provider.phone;
                    findMessage.providerId = provider._id;
                    findMessage.fee = provider.fee;
                    const appointment = await createAppointment(findMessage);
                    findMessage.appointmentId = appointment._id;
                    await this._mongoDbService.updateMessage(findMessage.id, findMessage);
                    const provConfirmationMessage =
                        this.messageBuilder.providerConfirmationTemplate(
                            provider.name,
                            findMessage,
                        );
                    buildedMessages.push(provConfirmationMessage);
                } catch {
                    findMessage.attempts++;
                    this._mongoDbService.updateMessage(findMessage.id, findMessage);
                    const errorResponse = this.errorResponseHandler(
                        infoMessage.clientPhone,
                    );
                    buildedMessages.push(errorResponse);
                }
                break;
            case STEPS.SELECT_PAYMENT:
                try {
                    findMessage.step = STEPS.SUBMIT_VOUCHER;
                    buildedMessages.push(
                        await this.updateAndBuildClientMessage(findMessage),
                    );
                } catch {
                    findMessage.attempts++;
                    this._mongoDbService.updateMessage(findMessage.id, findMessage);
                    const errorResponse = this.errorResponseHandler(
                        infoMessage.clientPhone,
                    );
                    buildedMessages.push(errorResponse);
                }
                break;
            case STEPS.SUBMIT_VOUCHER:
                try {
                    findMessage.step = STEPS.SEND_CONFIRMATION;
                    const waitingMessage = await this.updateAndBuildClientMessage(
                        findMessage,
                    );
                    buildedMessages.push(waitingMessage);
                    const voucher = await this.sendVoucherImage(
                        infoMessage.content,
                        findMessage,
                    );
                    await axios.patch(
                        `${process.env.API_SERVICE}/appointment/${findMessage.appointmentId}`,
                        {
                            voucher,
                        },
                    );
                } catch {
                    findMessage.attempts++;
                    this._mongoDbService.updateMessage(findMessage.id, findMessage);
                    const errorResponse = this.errorResponseHandler(
                        infoMessage.clientPhone,
                    );
                    buildedMessages.push(errorResponse);
                }
                break;
            default:
                buildedMessages.push(
                    this.messageBuilder.buildDefaultTemplate(infoMessage.clientPhone),
                );
        }
        return buildedMessages;

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

    private errorResponseHandler(phone: string) {
        return this.messageBuilder.buildDefaultTemplate(phone);
    }

    async updateAndBuildClientMessage(message: Message) {
        // Actualiza el mensaje en la base de datos con el nuevo paso
        await this._mongoDbService.updateMessage(message.id, message);
        // Construye el mensaje que corresponde segun el nuevo paso actualizado
        return this.messageBuilder.buildMessage(message);
    }

    async sendVoucherImage(imageUrl: string, message: Message) {
        try {

            const uploadResponse = await axios.post(
                `${process.env.API_SERVICE}/cloudinary/uploadurl`,
                {
                    url: imageUrl,
                },
            );
            const response = uploadResponse.data.secure_url;
            message.imageVoucher = response;
            await this._mongoDbService.updateMessage(message.id, message);
            return response;
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

}
