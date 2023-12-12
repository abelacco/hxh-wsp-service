import { BadRequestException, Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { STEPS } from '../config/constants';
import { UpdateMessageDto } from './dto/update-message.dto';
import { BotResponseService } from './bot-response/bot-response.service';
import {
  ProviderMessageValidator,
  receivedMessageValidator,
} from './helpers/receivedMessageValidator';
import { ProviderService } from 'src/providers/provider.service';
import { stringToDate, parseDateInput } from './helpers/dateParser';
import { createAppointment } from './helpers/createAppointment';
import axios from 'axios';
import { mongoErrorHandler } from 'src/common/hepers/mongoErrorHandler';
import { messageErrorHandler } from './helpers/messageErrorHandler';
import { ChatgtpService } from 'src/chatgtp/chatgtp.service';
import { SPECIALITIES_LIST } from './helpers/constants';
import { CohereService } from 'src/cohere/cohere.service';
import { IParsedMessage } from 'src/wsp/entities/parsedMessage';
import { NotificationService } from 'src/notification/notification.service';
import { Logger } from '@nestjs/common';
import { dateValidator } from './helpers/dateValidator';

const logger = new Logger('MessageService');
import { ID, SPECIAL_WORDS, WSP_MESSAGE_TYPES } from 'src/wsp/helpers/constants';
import { ClientHandlerService } from './client-handler/client-handler.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly messageBuilder: BotResponseService,
    private readonly clientHandlerService: ClientHandlerService,
    private readonly providerService: ProviderService,
    private readonly notificationService: NotificationService,
    private readonly chatgtpService: ChatgtpService,
    private readonly cohereService: CohereService,
  ) { }

  async processMessage(messageFromWSP: IParsedMessage): Promise<any> {
    Logger.log('INICIO DE PROCESAR MENSAJE', 'MESSAGE');
    Logger.log(`${this.isProviderMessage(messageFromWSP)}`, 'MESSAGE');

    // Determinar si el mensaje es del proveedor o del cliente
    if (this.isProviderMessage(messageFromWSP)) {
      return this.handleProviderMessage(messageFromWSP);
    } else {
      const currentMessage = await this.findOrCreateMessage(messageFromWSP);
      return this.clientHandlerService.handleClientMessage(messageFromWSP, currentMessage);
      // return this.handleClientMessage(messageFromWSP);
    }
  }

  private isProviderMessage(messageFromWSP: IParsedMessage): boolean {
    // Lógica para determinar si el mensaje es del proveedor
    return ProviderMessageValidator(messageFromWSP);
  }

  private async handleProviderMessage(messageFromWSP: IParsedMessage) {
    // Se extrae el id del cliente que esta en el boton cuando un proveedor acepta la disponibilidad y se busca el ultimo 
    //mensaje o carrito de compras
    const getMessageResponded = await this.findById(
      messageFromWSP.content.id.split('-')[1],
    );

    if (getMessageResponded.step === STEPS.SELECT_PROVIDER && !getMessageResponded.providerId) {
      return [await this.messageBuilder.buildProviderCard(messageFromWSP.clientPhone, getMessageResponded)];
    }
    return false;
    // return this.providerMessageHandler(messageFromWSP, getMessageResponded);
  }

  async findById(id: string): Promise<Message> {
    // Se debe crar una capa de servicios para hacer consultas a la base de datos
    const message = await this.messageModel.findById(id);
    return message;
  }




  private async findOrCreateMessage({ clientName, clientPhone }): Promise<Message> {
    Logger.log('FINDORCEATEMESSAGE','MESSAGE')
    // Vamos a verificar si el cliente existe en la base de datos
    // Hacer modulo para hacer peticiones para los servicios de proveedor y cliente
    const encodedName = encodeURIComponent(clientName);
    const getClient = await axios.get(
      `${process.env.API_SERVICE}/client/findorcreate?phone=${clientPhone}&name=${encodedName}`,
    );
    Logger.log(`CLIENT FROM DB: ${getClient.data}`,'MESSAGE')
    const client = getClient.data;
    //Busca mensaje por número de cliente
    const message = await this.messageModel.findOne({clientPhone: clientPhone});
    Logger.log(`CURRENT MESSAGE FROM DB: ${getClient.data}`,'MESSAGE')

    if (!message) {
      try {
        const createMessage = new this.messageModel({
          clientId: client._id,
          clientPhone: clientPhone,
          dni: client?.dni || null,
          // provider: '',
        });
        await createMessage.save();
        return createMessage;
      } catch (error) {
        logger.error(error);
      }
    }

    return message;
  }


  private handleInvalidStep(currentMessage, message): any {
    // Lógica para manejar pasos inválidos en el mensaje
  }

  private processStep(currentMessage, message): any {
    // Lógica para procesar el mensaje según el paso actual
  }

  private isValidStep(step: string, message: IParsedMessage): boolean {
    // Lógica para validar si el mensaje responde al paso actual
    // Responde si el mensaje es válido para el paso actual
    return receivedMessageValidator(step, message);
  }

  // async updateMessage(id: string, updateData: any): Promise<Message> {
  //   // Lógica para actualizar un mensaje en la base de datos
  // }
}



// private async handleClientMessage(message: IParsedMessage) {
//   // Obtener o crear el mensaje actual en la base de datos
//   const currentMessage = await this.findOrCreateMessage(message);

//   // Validar el paso actual del mensaje
//   if (!this.isValidStep(currentMessage.step, message)) {
//     return this.handleInvalidStep(currentMessage, message);
//   }

//   // Procesar el mensaje basado en el paso actual
//   return this.processStep(currentMessage, message);
// }

// async providerMessageHandler(infoMessage: IParsedMessage, message: Message) {
//   // En caso existan mas mensaje que provienen del proveedor aca deben agregarse
//   if (message.step === STEPS.SELECT_PROVIDER && !message.providerId) {
//     return [await this.messageBuilder.buildProviderCard(infoMessage.clientPhone, message)];
//   }
//   return false;
// }

// //   async proccessMessage(messageFromWSP: IParsedMessage) {
// //     // Valida si es una mensaje del proveedor para el paciente
// //     //Valida el paso actual del mensaje

// //     /*
// //       Get required info of the received message
// //     */
// //     console.log('mensaje parseado: ', messageFromWSP);
// //     const { clientPhone, content } = messageFromWSP;

// //     // Validar si es un mensaje del bot para el proveedor
// //     if (ProviderMessageValidator(messageFromWSP)) {
// //       const getMessageResponded = await this.findById(
// //         messageFromWSP.content.id.split('-')[1],
// //       );

// //       return this.providerMessageHandler(messageFromWSP, getMessageResponded);
// //     }
// //     // Si no es un mensaje del bot para el proveedor, se procesa como un mensaje del paciente
// //     // Esta pendiente crear la capa para hacer consultar a la base de datos de messages
// //     // Verificar si ya existe un mensaje del cliente y para determinar si necesitas el dni
// //     // Determina si en el carrito de compras(mensaje) existe un mensaje con el mismo número de telefono y que no tenga status SELECT_SPECIALTY Y INSERT_DATE
// //     const checkCurrentPath = await this.messageModel.findOne({
// //       $and: [
// //         {
// //           phone: clientPhone,
// //         },
// //         // {
// //         //   status: { $ne: STEPS.SELECT_SPECIALTY },
// //         // },
// //         {
// //           status: { $ne: STEPS.INSERT_DATE },
// //         },
// //       ],
// //     });
// // // Esta es una validacion para saber si no existe un mensaje en el carrito de compras o si te encuentras en el paso 0( ya empezaste a pedir una cita una vez)
// //     if (!checkCurrentPath || checkCurrentPath.step === '0') {
// //       try {
// //         // La IA determina si el primer mensaje es un saludo o un mensaje pidiendo ya una especialidad
// //         const iaResponse = await this.cohereService.classyfier(
// //           content.title || content,
// //         );
// //         if (iaResponse === 'greetings' && !checkCurrentPath) {
// //           //busca o crear el mensaje (carrito de compras)
// //           const findMessage = await this.findOrCreateMessage(messageFromWSP);
// //           //Busca mensaje por número de cliente 
// //           const findDni = await this.messageModel.findOne({
// //             phone: clientPhone,
// //           });
// //           findMessage.step = findDni.dni ? STEPS.PUT_DNI : STEPS.PUT_DNI;
// //           const response = await this.updateAndBuildClientMessage(findMessage);
// //           return [response];
// //         }

// //         if (iaResponse === 'provider') {
// //           const response =
// //             this.messageBuilder.providerLinkTemplate(clientPhone);
// //           return [response];
// //         }

// //         return [this.messageBuilder.buildIntroMessage(clientPhone)];
// //       } catch (e) {
// //         console.log(e);
// //         const errorResponse = this.errorResponseHandler(clientPhone);
// //         return [errorResponse];
// //       }
// //     }
// //     // Envio al handler de pacients el mensaje de Wsp y el paso actual del mensaje
// //     return await this.clientMessageHandler(messageFromWSP, checkCurrentPath);
// //   }

// //   // Recibes el mensaje deestructurado y el mensaje de la base de datos con el step actual
//   async clientMessageHandler(
//     infoMessage: IParsedMessage,
//     findMessage: Message,
//   ) {
//     const buildedMessages = [];
//     /*
//       Reset the information of the client message
//     */
//     if (
//       (infoMessage.type === WSP_MESSAGE_TYPES.TEXT &&
//         infoMessage.content.toUpperCase() === SPECIAL_WORDS.RESET) ||
//       (infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE &&
//         infoMessage.content?.title?.toUpperCase() === SPECIAL_WORDS.RESET)
//     ) {
//       const resetedMessage = this.resetMessage(findMessage);
//       buildedMessages.push(
//         await this.updateAndBuildClientMessage(resetedMessage),
//       );
//       return buildedMessages;
//     }
//     // Valida que el contenido que llega respone al step actual del mensaje
//     const validateStep = receivedMessageValidator(
//       findMessage.step,
//       infoMessage,
//     );
//     // Si el contenido no responde al step actual del mensaje entonces se aumenta el contador de intentos
//     // y se envia un mensaje de error
//     console.log('validacion: ', validateStep);
//     if (!validateStep) {
//       findMessage.attempts++;
//       await this.updateMessage(findMessage.id, findMessage);
//       const errorMessage = messageErrorHandler(findMessage);
//       buildedMessages.push(...errorMessage);
//       return buildedMessages;
//     }
//     // Si el contenido responder al step actual del mensaje entonces se procede a realizar validaciones internas
//     // se actualizar el paso del mensaje y se construye el mensaje de respuesta
//     console.log("findMessage.step", findMessage.step);
//     switch (findMessage.step) {
//       /*
//         Handle what message template would be returned
//         according to the step
//       */
//       case STEPS.PUT_DNI:
//         try {
//           // Acepta que nombre y apellido coinciden con el dni
//           if (
//             infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE &&
//             infoMessage.content.id === 'accpt_dni'
//           ) {
//             // Actualiza el paso del mensaje
//             findMessage.step = STEPS.INSERT_DATE;
//             // Actualizas el name y el dni en la base de datos de pacientes
//             await axios.patch(
//               `${process.env.API_SERVICE}/client/${findMessage.clientId}`,{dni: findMessage.dni, name: findMessage.clientName},
//             );
//             // Actualizas el mensaje en la base de datos y ademas construyes el mensaje de respuesta
//             buildedMessages.push(
//               await this.updateAndBuildClientMessage(findMessage),
//             );
//             return buildedMessages;
//           }
//           // Rechaza que nombre y apellido no coinciden con el dni
//           if (
//             infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE &&
//             infoMessage.content.id === ID.RETRY_DNI
//           ) {
//             buildedMessages.push(
//               this.messageBuilder.buildMessage(findMessage),
//             );
//             return buildedMessages;
//           }
//           // Cuando ingresan el dni se hace una consulta a la api de perú
//           const dniRequest = await axios.get(
//             `${process.env.API_SERVICE}/apiperu?idNumber=${infoMessage.content}`,
//           );
//           const dniResponse = dniRequest.data;
//           if (dniResponse.success === true) {
//             const dniName = `${dniResponse.nombres} ${dniResponse.apellidoPaterno} ${dniResponse.apellidoMaterno}`;
//             findMessage.dni = infoMessage.content;
//             findMessage.clientName = dniName;
//             await this.updateMessage(findMessage.id, findMessage);
//             buildedMessages.push(
//               this.messageBuilder.buildDniConfirmationMessage(
//                 infoMessage.clientPhone,
//                 dniName
//               ),
//             );
//           } else {
//             throw new BadRequestException();
//           }
//         } catch {
//           findMessage.attempts++;
//           this.updateMessage(findMessage.id, findMessage);
//           if(infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE) {
//             const errorMessage = this.messageBuilder.buildDefaultTemplate(infoMessage.clientPhone);
//             buildedMessages.push(errorMessage);
//           } else {
//             const errorMessage = messageErrorHandler(findMessage);
//             buildedMessages.push(...errorMessage);
//           }
//         }
//         break;
//       case STEPS.INSERT_DATE:
//         try {
//           if (
//             infoMessage.content.id &&
//             infoMessage.content.id === ID.ACCEPT_DATE
//           ) {
//             findMessage.step = STEPS.SELECT_PROVIDER;
//             await this.updateMessage(findMessage.id, findMessage);
//             const ClientMessage =
//               this.messageBuilder.searchingProviderTemplateBuilder(
//                 infoMessage.clientPhone,
//               );
//             buildedMessages.push(ClientMessage);
//             this.notifyProviders(findMessage);
//             return buildedMessages;
//           }

//           if (
//             infoMessage.content.id &&
//             infoMessage.content.id === 'retry_date'
//           ) {
//             buildedMessages.push(this.messageBuilder.buildMessage(findMessage));
//             return buildedMessages;
//           }

//           // const dateFromChatGpt = await this.chatgtpService.getDateResponse(
//           //   infoMessage.content,
//           // );
//           const dateParsed = parseDateInput(
//             infoMessage.content,
//           );
//           if (
//             dateParsed.includes('NO_DATE') ||
//             !dateValidator(dateParsed)
//           )
//           {
//             console.log('FECHA NO VÁLIDA');
//             throw new BadRequestException();

//           }
//           findMessage.date = stringToDate(dateParsed);
//           await this.updateMessage(findMessage.id, findMessage);
//           const dateConfirmationMessage =
//             this.messageBuilder.dateConfirmationTemplate(
//               infoMessage.clientPhone,
//               findMessage.date,
//             );
//           console.log('dateConfirmationMessage', dateConfirmationMessage);
//           buildedMessages.push(dateConfirmationMessage);
//         } catch (error) {
//           console.log("error",error);
//           findMessage.attempts++;
//           this.updateMessage(findMessage.id, findMessage);
//           const errorResponse = this.errorResponseHandler(
//             infoMessage.clientPhone,
//           );
//           buildedMessages.push(errorResponse);
//         }
//         break;
//       case STEPS.SELECT_PROVIDER:
//         try {
//           if (
//             infoMessage.content.id &&
//             infoMessage.content.id === ID.ACEPT_PROVIDER
//           ) {
//             findMessage.step = STEPS.SELECT_PAYMENT;
//             buildedMessages.push(
//               await this.updateAndBuildClientMessage(findMessage),
//             );
//             return buildedMessages;
//           }

//           if (
//             infoMessage.content.id &&
//             infoMessage.content.id === ID.CHOOSE_ANOTHER
//           ) {
//             return;
//           }

//           const provider = await this.providerService.findById(
//             infoMessage.content.id,
//           );
//           findMessage.providerPhone = provider.phone;
//           findMessage.providerId = provider._id;
//           findMessage.fee = provider.fee;
//           const appointment = await createAppointment(findMessage);
//           findMessage.appointmentId = appointment._id;
//           await this.updateMessage(findMessage.id, findMessage);
//           const provConfirmationMessage =
//             this.messageBuilder.providerConfirmationTemplate(
//               provider.name,
//               findMessage,
//             );
//           buildedMessages.push(provConfirmationMessage);
//         } catch {
//           findMessage.attempts++;
//           this.updateMessage(findMessage.id, findMessage);
//           const errorResponse = this.errorResponseHandler(
//             infoMessage.clientPhone,
//           );
//           buildedMessages.push(errorResponse);
//         }
//         break;
//       case STEPS.SELECT_PAYMENT:
//         try {
//           findMessage.step = STEPS.SUBMIT_VOUCHER;
//           buildedMessages.push(
//             await this.updateAndBuildClientMessage(findMessage),
//           );
//         } catch {
//           findMessage.attempts++;
//           this.updateMessage(findMessage.id, findMessage);
//           const errorResponse = this.errorResponseHandler(
//             infoMessage.clientPhone,
//           );
//           buildedMessages.push(errorResponse);
//         }
//         break;
//       case STEPS.SUBMIT_VOUCHER:
//         try {
//           findMessage.step = STEPS.SEND_CONFIRMATION;
//           const waitingMessage = await this.updateAndBuildClientMessage(
//             findMessage,
//           );
//           buildedMessages.push(waitingMessage);
//           const voucher = await this.sendVoucherImage(
//             infoMessage.content,
//             findMessage,
//           );
//           await axios.patch(
//             `${process.env.API_SERVICE}/appointment/${findMessage.appointmentId}`,
//             {
//               voucher,
//             },
//           );
//         } catch {
//           findMessage.attempts++;
//           this.updateMessage(findMessage.id, findMessage);
//           const errorResponse = this.errorResponseHandler(
//             infoMessage.clientPhone,
//           );
//           buildedMessages.push(errorResponse);
//         }
//         break;
//       default:
//         buildedMessages.push(
//           this.messageBuilder.buildDefaultTemplate(infoMessage.clientPhone),
//         );
//     }
//     return buildedMessages;
//   }


//   resetMessage(message: Message) {
//     message.step = STEPS.INIT;
//     message.attempts = 0;
//     message.providerId = '';
//     message.providerPhone = '';
//     message.date = null;

//     return message;
//   }

//   async notifyProviders(message: Message) {
//     const messages = await this.messageBuilder.buildProviderNotification(message);
//     for (const message of messages) {
//       await this.notificationService.sendNotification(message);
//     }
//   }

//   // async chatGptHandler(messageInfo, dbMessage) {
//   //   const finalMessages = [];
//   //   if (messageInfo.type === 'text') {
//   //     const response = await this.chatgtpService.getResponse(
//   //       messageInfo.content,
//   //     );
//   //     if (response.specialist) {
//   //       console.log('Especialidad encontrada');
//   //       const specialistSelected = SPECIALITIES_LIST.find(
//   //         (speciality) => speciality.title === response.specialist,
//   //       );
//   //       if (specialistSelected) {
//   //         finalMessages.push(
//   //           this.messageBuilder.buildMessageChatGTP(
//   //             response.response,
//   //             dbMessage.phone,
//   //             specialistSelected.title,
//   //           ),
//   //         );
//   //       } else {
//   //         console.log('Especialidad no encontrada');
//   //       }
//   //     }
//   //     finalMessages.push(
//   //       this.messageBuilder.buildMessageChatGTP(
//   //         response.response,
//   //         dbMessage.phone,
//   //       ),
//   //     );
//   //   } else {
//   //     if (messageInfo.content !== 'Otra especialidad') {
//   //       dbMessage.step = STEPS.SELECT_SPECIALTY;
//   //       finalMessages.push(await this.updateAndBuildClientMessage(dbMessage));
//   //     } else {
//   //       dbMessage.step = STEPS.INSERT_DATE;
//   //       finalMessages.push(await this.updateAndBuildClientMessage(dbMessage));
//   //     }
//   //   }
//   //   return finalMessages;
//   // }

//   async sendVoucherImage(imageUrl: string, message: Message) {
//     try {
//       // const imageData = await axios.get(imageUrl, {
//       //   responseType: 'arraybuffer',
//       //   headers: {
//       //     Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
//       //   },
//       // });
//       // const imageBinary = imageData.data;
//       // const mimeType = imageData.headers['content-type'];
//       // const base64Image = binaryToBase64(imageBinary, mimeType);
//       const uploadResponse = await axios.post(
//         `${process.env.API_SERVICE}/cloudinary/uploadurl`,
//         {
//           url: imageUrl,
//         },
//       );
//       const response = uploadResponse.data.secure_url;
//       message.imageVoucher = response;
//       await this.updateMessage(message.id, message);
//       return response;
//     } catch (error) {
//       console.error('Error al obtener la imagen:', error);
//     }
//   }



//   errorResponseHandler(phone: string) {
//     return this.messageBuilder.buildDefaultTemplate(phone);
//   }

//   async createStatusNotification(message: Message) {
//     const messages = [];
//     const query = await axios.get(
//       `${process.env.API_SERVICE}/appointment/${message.appointmentId}`,
//     );
//     const appointment = query.data;
//     const date = message.date;
//     if (message.status === '2') {
//       messages.push(
//         ...this.messageBuilder.buildConfirmationTemplates(appointment),
//       );
//       return messages;
//     }

//     messages.push(
//       this.messageBuilder.buildRejectionNotification(date, message.phone),
//       this.messageBuilder.buildRejectionNotification(date, message.providerPhone),
//     );
//     return messages;
//   }

//   async updateAndBuildClientMessage(message: Message) {
//     // Actualiza el mensaje en la base de datos con el nuevo paso
//     await this.updateMessage(message.id, message);
//     // Construye el mensaje que corresponde segun el nuevo paso actualizado
//     return this.messageBuilder.buildMessage(message);
//   }



//   async findByAppointmentId(id: string): Promise<Message> {
//     const message = await this.messageModel.findOne({
//       appointmentId: id,
//     });
//     return message;
//   }



//   async create(createMessageDto: any) {
//     try {
//       const message = await this.messageModel.create(createMessageDto);
//       return message;
//     } catch (error) {
//       mongoErrorHandler(error);
//     }
//   }

//   findAll() {
//     return `This action returns all message`;
//   }

//   async findOne(phone: string) {
//     const message = await this.messageModel.findOne({ phone: phone });
//     return message;
//   }

//   async updateMessage(id: string, updateMessageDto: UpdateMessageDto) {
//     const updatedMessage = await this.messageModel.findByIdAndUpdate(
//       id,
//       updateMessageDto,
//       { new: true },
//     );
//     return updatedMessage;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} message`;
//   }

//   async testDate(date: string) {
//     const dateParsed = parseDateInput(date);
//     console.log('VALIDANDO FECHA NO DATE', dateParsed.includes('NO_DATE'));
//     if (
//       dateParsed.includes('NO_DATE') ||
//       !dateValidator(dateParsed)
//     )
//     {
//       console.log('ES NO VALIDO');
//       throw new BadRequestException();

//     }
//     return dateParsed;
//   }

