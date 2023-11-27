import { BadRequestException, Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { STEPS } from '../config/constants';
import { UpdateMessageDto } from './dto/update-message.dto';
import { BotResponseService } from './bot-response/bot-response.service';
import {
  DoctorMessageValidator,
  receivedMessageValidator,
} from './helpers/receivedMessageValidator';
import { DoctorService } from 'src/doctor/doctor.service';
import { stringToDate , parseDateInput } from './helpers/dateParser';
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
import { WSP_MESSAGE_TYPES } from 'src/wsp/helpers/constants';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly messageBuilder: BotResponseService,
    private readonly doctorService: DoctorService,
    private readonly notificationService: NotificationService,
    private readonly chatgtpService: ChatgtpService,
    private readonly cohereService: CohereService,
  ) {}

  async proccessMessage(messageFromWSP: IParsedMessage) {
    /*
      Get required info of the received message
    */
    console.log('mensaje parseado: ', messageFromWSP);
    const { clientPhone, content } = messageFromWSP;

    // Validar si es un mensaje del bot para el doctor
    if (DoctorMessageValidator(messageFromWSP)) {
      const getMessageResponded = await this.findById(
        messageFromWSP.content.id.split('-')[1],
      );

      return this.doctorMessageHandler(messageFromWSP, getMessageResponded);
    }
    // Si no es un mensaje del bot para el doctor, se procesa como un mensaje del paciente
    // Esta pendiente crear la capa para hacer consultar a la base de datos de messages
    // Verificar si ya existe un mensaje del cliente y para determinar si necesitas el dni
    // Determina si en el carrito de compras(mensaje) existe un mensaje con el mismo número de telefono y que no tenga status SELECT_SPECIALTY Y INSERT_DATE
    const checkCurrentPath = await this.messageModel.findOne({
      $and: [
        {
          phone: clientPhone,
        },
        {
          status: { $ne: STEPS.SELECT_SPECIALTY },
        },
        {
          status: { $ne: STEPS.INSERT_DATE },
        },
      ],
    });
// Esta es una validacion para saber si no existe un mensaje en el carrito de compras o si te encuentras en el paso 0( ya empezaste a pedir una cita una vez)
    if (!checkCurrentPath || checkCurrentPath.step === '0') {
      try {
        // La IA determina si el primer mensaje es un saludo o un mensaje pidiendo ya una especialidad
        const iaResponse = await this.cohereService.classyfier(
          content.title || content,
        );
        //Si la IA determina que el topico es especialidad y ademas no existe ningun mensaje(carrito de compras) en la base de datos
        if (iaResponse === 'speciality' && !checkCurrentPath) {
          //busca o crear el mensaje (carrito de compras)
          const findMessage = await this.findOrCreateMessage(messageFromWSP);
          //Busca mensaje por número de cliente 
          const findDni = await this.messageModel.findOne({
            phone: clientPhone,
          });
          findMessage.step = findDni.dni ? STEPS.SELECT_SPECIALTY : STEPS.PUT_DNI;
          const response = await this.updateAndBuildPatientMessage(findMessage);
          return [response];
        }
        //Si la IA determina que el topico es especialidad y ademas existe un mensaje(carrito de compras) en la base de datos en el paso 0
        if (iaResponse === 'speciality' && checkCurrentPath) {
          const findDni = await this.messageModel.findOne({
            phone: clientPhone,
          });
          // Antes debemos validar si tenemos su dni 
          // Si lo tenemos entonces debemos actualizar al paso de enviar template de especialidades
          // Si no lo tenemos entonces debemos actualizar al paso de pedir dni
          checkCurrentPath.step = findDni.dni ? STEPS.SELECT_SPECIALTY : STEPS.PUT_DNI;
          // Construye el mensaje de respuesta a partir del paso actual del mensaje
          const response = await this.updateAndBuildPatientMessage(
            checkCurrentPath,
          );
          return [response];
        }

        if (iaResponse === 'specialist') {
          const response =
            this.messageBuilder.specialistLinkTemplate(clientPhone);
          return [response];
        }

        return [this.messageBuilder.buildIntroMessage(clientPhone)];
      } catch (e) {
        console.log(e);
        const errorResponse = this.errorResponseHandler(clientPhone);
        return [errorResponse];
      }
    }
    // Envio al handler de pacients el mensaje de Wsp y el paso actual del mensaje
    return await this.patientMessageHandler(messageFromWSP, checkCurrentPath);

    /*
      Verify if it's a doctor response or
      a patient message
    */

    /*
      Agregar en el if la opcion de que el content del param messageFromWSP
      contiente una palabra clave que identifique al path de afiliacion
      if else (messageFromWSP.content === 'const.afiliacionCode') {
        return afiliacionHandler();
      }
    */
  }

  /*
      Manejador de afiliacion, debe retornar un array de templates
      afiliacionHandler() {
        validadores ...
        switch() {} ...
      }
    */

  // Recibes el mensaje deestructurado y el mensaje de la base de datos con el step actual
  async patientMessageHandler(
    infoMessage: IParsedMessage,
    findMessage: Message,
  ) {
    const buildedMessages = [];
    /*
      Reset the information of the patient message
    */
    if (
      (infoMessage.type === WSP_MESSAGE_TYPES.TEXT &&
        infoMessage.content.toUpperCase() === 'RESET') ||
      (infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE &&
        infoMessage.content?.title?.toUpperCase() === 'RESET')
    ) {
      const resetedMessage = this.resetMessage(findMessage);
      buildedMessages.push(
        await this.updateAndBuildPatientMessage(resetedMessage),
      );
      return buildedMessages;
    }
    // Valida que el contenido que llega respone al step actual del mensaje
    const validateStep = receivedMessageValidator(
      findMessage.step,
      infoMessage,
    );
    // Si el contenido no responde al step actual del mensaje entonces se aumenta el contador de intentos
    // y se envia un mensaje de error
    console.log('validacion: ', validateStep);
    if (!validateStep) {
      findMessage.attempts++;
      await this.updateMessage(findMessage.id, findMessage);
      const errorMessage = messageErrorHandler(findMessage);
      buildedMessages.push(...errorMessage);
      return buildedMessages;
    }
    // Si el contenido responder al step actual del mensaje entonces se procede a realizar validaciones internas
    // se actualizar el paso del mensaje y se construye el mensaje de respuesta
    switch (findMessage.step) {
      /*
        Handle what message template would be returned
        according to the step
      */
      case STEPS.PUT_DNI:
        try {
          // Acepta que nombre y apellido coinciden con el dni
          if (
            infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE &&
            infoMessage.content.id === 'accpt_dni'
          ) {
            // Actualiza el paso del mensaje
            findMessage.step = STEPS.SELECT_SPECIALTY;
            // Actualizas el name y el dni en la base de datos de pacientes
            const updatePatientInfo = await axios.patch(
              `${process.env.API_SERVICE}/patient/${findMessage.phone}`,{dni: findMessage.dni, name: findMessage.clientName},
            );
            console.log("updatePatientInfo", updatePatientInfo);
            // Actualizas el mensaje en la base de datos y ademas construyes el mensaje de respuesta
            buildedMessages.push(
              await this.updateAndBuildPatientMessage(findMessage),
            );
            return buildedMessages;
          }
          // Rechaza que nombre y apellido no coinciden con el dni
          if (
            infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE &&
            infoMessage.content.id === 'retry_dni'
          ) {
            buildedMessages.push(
              this.messageBuilder.buildMessage(findMessage),
            );
            return buildedMessages;
          }
          // Cuando ingresan el dni se hace una consulta a la api de perú
          const dniRequest = await axios.get(
            `${process.env.API_SERVICE}/apiperu?idNumber=${infoMessage.content}`,
          );
          const dniResponse = dniRequest.data;
          if (dniResponse.success === true) {
            const dniName = `${dniResponse.nombres} ${dniResponse.apellidoPaterno} ${dniResponse.apellidoMaterno}`;
            findMessage.dni = infoMessage.content;
            findMessage.clientName = dniName;
            await this.updateMessage(findMessage.id, findMessage);
            buildedMessages.push(
              this.messageBuilder.buildDniConfirmationMessage(
                infoMessage.clientPhone,
                dniName
              ),
            );
          } else {
            throw new BadRequestException();
          }
        } catch {
          findMessage.attempts++;
          this.updateMessage(findMessage.id, findMessage);
          if(infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE) {
            const errorMessage = this.messageBuilder.buildDefaultTemplate(infoMessage.clientPhone);
            buildedMessages.push(errorMessage);
          } else {
            const errorMessage = messageErrorHandler(findMessage);
            buildedMessages.push(...errorMessage);
          }
        }
        break;
      case STEPS.SELECT_SPECIALTY:
        try {
          if (
            infoMessage.content.id &&
            infoMessage.content.id === 'accpt_speciality'
          ) {
            findMessage.step = STEPS.INSERT_DATE;
            buildedMessages.push(
              await this.updateAndBuildPatientMessage(findMessage),
            );
            return buildedMessages;
          }

          if (
            infoMessage.content.id &&
            infoMessage.content.id === 'retry_speciality'
          ) {
            buildedMessages.push(this.messageBuilder.buildMessage(findMessage));
            return buildedMessages;
          }

          findMessage.speciality = infoMessage.content.title;
          await this.updateMessage(findMessage.id, findMessage);
          const phone = findMessage.phone;
          const speciality = findMessage.speciality;
          const specialityConfirmationMessage =
            this.messageBuilder.specialityConfirmationTemplate(
              phone,
              speciality,
            );
          buildedMessages.push(specialityConfirmationMessage);
        } catch {
          findMessage.attempts++;
          this.updateMessage(findMessage.id, findMessage);
          const errorResponse = this.errorResponseHandler(
            infoMessage.clientPhone,
          );
          buildedMessages.push(errorResponse);
        }
        break;
      case STEPS.INSERT_DATE:
        try {
          if (
            infoMessage.content.id &&
            infoMessage.content.id === 'accpt_date'
          ) {
            findMessage.step = STEPS.SELECT_DOCTOR;
            await this.updateMessage(findMessage.id, findMessage);
            const patientMessage =
              this.messageBuilder.searchingDoctorTemplateBuilder(
                infoMessage.clientPhone,
              );
            buildedMessages.push(patientMessage);
            this.notifyDoctors(findMessage);
            return buildedMessages;
          }

          if (
            infoMessage.content.id &&
            infoMessage.content.id === 'retry_date'
          ) {
            buildedMessages.push(this.messageBuilder.buildMessage(findMessage));
            return buildedMessages;
          }

          // const dateFromChatGpt = await this.chatgtpService.getDateResponse(
          //   infoMessage.content,
          // );
          const dateParsed = parseDateInput(
            infoMessage.content,
          );
          if (
            dateParsed.includes('NO_DATE') ||
            !dateValidator(dateParsed)
          )
          {
            console.log('FECHA NO VÁLIDA');
            throw new BadRequestException();
      
          }
          findMessage.date = stringToDate(dateParsed);
          await this.updateMessage(findMessage.id, findMessage);
          const dateConfirmationMessage =
            this.messageBuilder.dateConfirmationTemplate(
              infoMessage.clientPhone,
              findMessage.date,
            );
          console.log('dateConfirmationMessage', dateConfirmationMessage);
          buildedMessages.push(dateConfirmationMessage);
        } catch (error) {
          console.log("error",error);
          findMessage.attempts++;
          this.updateMessage(findMessage.id, findMessage);
          const errorResponse = this.errorResponseHandler(
            infoMessage.clientPhone,
          );
          buildedMessages.push(errorResponse);
        }
        break;
      case STEPS.SELECT_DOCTOR:
        try {
          if (
            infoMessage.content.id &&
            infoMessage.content.id === 'accpt_doctor'
          ) {
            findMessage.step = STEPS.SELECT_PAYMENT;
            buildedMessages.push(
              await this.updateAndBuildPatientMessage(findMessage),
            );
            return buildedMessages;
          }

          if (
            infoMessage.content.id &&
            infoMessage.content.id === 'retry_doctor'
          ) {
            return;
          }

          const doctor = await this.doctorService.findById(
            infoMessage.content.id,
          );
          findMessage.doctorPhone = doctor.phone;
          findMessage.doctorId = doctor._id;
          findMessage.fee = doctor.fee;
          const appointment = await createAppointment(findMessage);
          findMessage.appointmentId = appointment._id;
          await this.updateMessage(findMessage.id, findMessage);
          const docConfirmationMessage =
            this.messageBuilder.doctorConfirmationTemplate(
              doctor.name,
              findMessage,
            );
          buildedMessages.push(docConfirmationMessage);
        } catch {
          findMessage.attempts++;
          this.updateMessage(findMessage.id, findMessage);
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
            await this.updateAndBuildPatientMessage(findMessage),
          );
        } catch {
          findMessage.attempts++;
          this.updateMessage(findMessage.id, findMessage);
          const errorResponse = this.errorResponseHandler(
            infoMessage.clientPhone,
          );
          buildedMessages.push(errorResponse);
        }
        break;
      case STEPS.SUBMIT_VOUCHER:
        try {
          findMessage.step = STEPS.SEND_CONFIRMATION;
          const waitingMessage = await this.updateAndBuildPatientMessage(
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
          this.updateMessage(findMessage.id, findMessage);
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

  resetMessage(message: Message) {
    message.step = STEPS.INIT;
    message.attempts = 0;
    message.speciality = '';
    message.doctorId = '';
    message.doctorPhone = '';
    message.date = null;

    return message;
  }

  async notifyDoctors(message: Message) {
    const messages = await this.messageBuilder.buildDoctorNotification(message);
    for (const message of messages) {
      await this.notificationService.sendNotification(message);
    }
  }

  async chatGptHandler(messageInfo, dbMessage) {
    const finalMessages = [];
    if (messageInfo.type === 'text') {
      const response = await this.chatgtpService.getResponse(
        messageInfo.content,
      );
      if (response.specialist) {
        console.log('Especialidad encontrada');
        const specialistSelected = SPECIALITIES_LIST.find(
          (speciality) => speciality.title === response.specialist,
        );
        if (specialistSelected) {
          finalMessages.push(
            this.messageBuilder.buildMessageChatGTP(
              response.response,
              dbMessage.phone,
              specialistSelected.title,
            ),
          );
        } else {
          console.log('Especialidad no encontrada');
        }
      }
      finalMessages.push(
        this.messageBuilder.buildMessageChatGTP(
          response.response,
          dbMessage.phone,
        ),
      );
    } else {
      if (messageInfo.content !== 'Otra especialidad') {
        dbMessage.step = STEPS.SELECT_SPECIALTY;
        finalMessages.push(await this.updateAndBuildPatientMessage(dbMessage));
      } else {
        dbMessage.step = STEPS.INSERT_DATE;
        finalMessages.push(await this.updateAndBuildPatientMessage(dbMessage));
      }
    }
    return finalMessages;
  }

  async sendVoucherImage(imageUrl: string, message: Message) {
    try {
      // const imageData = await axios.get(imageUrl, {
      //   responseType: 'arraybuffer',
      //   headers: {
      //     Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
      //   },
      // });
      // const imageBinary = imageData.data;
      // const mimeType = imageData.headers['content-type'];
      // const base64Image = binaryToBase64(imageBinary, mimeType);
      const uploadResponse = await axios.post(
        `${process.env.API_SERVICE}/cloudinary/uploadurl`,
        {
          url: imageUrl,
        },
      );
      const response = uploadResponse.data.secure_url;
      message.imageVoucher = response;
      await this.updateMessage(message.id, message);
      return response;
    } catch (error) {
      console.error('Error al obtener la imagen:', error);
    }
  }

  async doctorMessageHandler(infoMessage: IParsedMessage, message: Message) {
    if (message.step === STEPS.SELECT_DOCTOR && !message.doctorId) {
      return [await this.messageBuilder.buildDoctorCard(infoMessage.clientPhone, message)];
    }
    return false;
  }

  errorResponseHandler(phone: string) {
    return this.messageBuilder.buildDefaultTemplate(phone);
  }

  async createStatusNotification(message: Message) {
    const messages = [];
    const query = await axios.get(
      `${process.env.API_SERVICE}/appointment/${message.appointmentId}`,
    );
    const appointment = query.data;
    const date = message.date;
    if (message.status === '2') {
      messages.push(
        ...this.messageBuilder.buildConfirmationTemplates(appointment),
      );
      return messages;
    }

    messages.push(
      this.messageBuilder.buildRejectionNotification(date, message.phone),
      this.messageBuilder.buildRejectionNotification(date, message.doctorPhone),
    );
    return messages;
  }

  async updateAndBuildPatientMessage(message: Message) {
    // Actualiza el mensaje en la base de datos con el nuevo paso
    await this.updateMessage(message.id, message);
    // Construye el mensaje que corresponde segun el nuevo paso actualizado
    return this.messageBuilder.buildMessage(message);
  }

  async findById(id: string): Promise<Message> {
    const message = await this.messageModel.findById(id);
    return message;
  }

  async findByAppointmentId(id: string): Promise<Message> {
    const message = await this.messageModel.findOne({
      appointmentId: id,
    });
    return message;
  }

  async findOrCreateMessage(receivedMessage: IParsedMessage): Promise<Message> {
    /*
      Find or create a new message
      Receive a parsed message
    */
      const encodedName = encodeURIComponent(receivedMessage.clientName);
    const getPatient = await axios.get(
      `${process.env.API_SERVICE}/patient/findorcreate?phone=${receivedMessage.clientPhone}&name=${encodedName}`,
    );
    const patient = getPatient.data;
    const message = await this.messageModel.findOne({
      $and: [
        {
          phone: receivedMessage.clientPhone,
        },
        {
          status: { $ne: '2' },
        },
        {
          status: { $ne: '3' },
        },
      ],
    });
    if (!message) {
      try {
        const createMessage = new this.messageModel({
          clientId: patient._id,
          phone: receivedMessage.clientPhone,
          doctor: '',
        });
        await createMessage.save();
        return createMessage;
      } catch (error) {
        logger.error(error);
      }
    }

    return message;
  }

  async create(createMessageDto: any) {
    try {
      const message = await this.messageModel.create(createMessageDto);
      return message;
    } catch (error) {
      mongoErrorHandler(error);
    }
  }

  findAll() {
    return `This action returns all message`;
  }

  async findOne(phone: string) {
    const message = await this.messageModel.findOne({ phone: phone });
    return message;
  }

  async updateMessage(id: string, updateMessageDto: UpdateMessageDto) {
    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      id,
      updateMessageDto,
      { new: true },
    );
    return updatedMessage;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }

  async testDate(date: string) {
    const dateParsed = parseDateInput(date);
    console.log('VALIDANDO FECHA NO DATE', dateParsed.includes('NO_DATE'));
    if (
      dateParsed.includes('NO_DATE') ||
      !dateValidator(dateParsed)
    )
    {
      console.log('ES NO VALIDO');
      throw new BadRequestException();

    }
    return dateParsed;
  }
}
