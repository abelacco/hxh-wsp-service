import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { STEPS } from '../config/constants';
import { messageDestructurer } from './helpers/messageDestructurer';
import { IParsedMessage } from './entities/parsedMessage';
import { UpdateMessageDto } from './dto/update-message.dto';
import { BotResponseService } from './bot-response/bot-response.service';
import { WspReceivedMessageDto } from './dto/wspReceivedMessage.dto';
import {
  DoctorMessageValidator,
  receivedMessageValidator,
} from './helpers/receivedMessageValidator';
import { DoctorService } from 'src/doctor/doctor.service';
import { stringToDate } from './helpers/dateParser';
import { createAppointment } from './helpers/createAppointment';
import axios from 'axios';
import { ChatgtpService } from 'src/chatgtp/chatgtp.service';
import { SPECIALITIES_LIST } from './helpers/constants';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly messageBuilder: BotResponseService,
    private readonly doctorService: DoctorService,
    private readonly chatgtpService: ChatgtpService,
  ) { }

  async proccessMessage(messageFromWSP: WspReceivedMessageDto) {
    /*
      Get required info of the received message
    */
    const infoMessage = messageDestructurer(messageFromWSP);
    console.log('mensaje parseado: ', infoMessage);

    /*
      Verify if it's a doctor response or
      a patient message
    */
    if (!DoctorMessageValidator(infoMessage)) {
      const findMessage = await this.findOrCreateMessage(infoMessage);
      return await this.patientMessageHandler(infoMessage, findMessage);
    } else {
      const getMessageResponded = await this.findById(
        infoMessage.content.id.split('-')[1],
      );

      return this.doctorMessageHandler(infoMessage, getMessageResponded);
    }
  }

  async patientMessageHandler(
    infoMessage: IParsedMessage,
    findMessage: Message,
  ) {
    const buildedMessages = [];
    /*
      Reset the information of the patient message
    */
    if (
      infoMessage.type === 'text' &&
      infoMessage.content.toUpperCase() === 'RESET'
    ) {
      findMessage.step = STEPS.SELECT_SPECIALTY;
      findMessage.speciality = '';
      findMessage.doctorId = '';
      findMessage.doctorPhone = '';
      findMessage.date = null;
      buildedMessages.push(
        await this.updateAndBuildPatientMessage(findMessage),
      );
      return buildedMessages;
    }

    const validateStep = receivedMessageValidator(
      findMessage.step,
      infoMessage,
    );
    console.log('validacion: ', validateStep);
    if (!validateStep) return false;
    switch (findMessage.step) {
      /*
        Handle what message template would be returned
        according to the step
      */
      case STEPS.CHAT_GTP:
        if(infoMessage.type === 'text') {
          const response = await this.chatgtpService.getResponse(
            infoMessage.content,
          );
          if (response.specialist) {
            const specialistSelected = SPECIALITIES_LIST.find((speciality) => speciality.title === response.specialist);
            if (specialistSelected) {
              buildedMessages.push(this.messageBuilder.buildMessageChatGTP(response.response, findMessage.phone, specialistSelected.title));
            } else {
              console.log('Especialidad no encontrada');
            }
          }
          buildedMessages.push(this.messageBuilder.buildMessageChatGTP(response.response, findMessage.phone));
        } else {
          if(infoMessage.content !== 'Otra especialidad') {
            findMessage.step = STEPS.SELECT_SPECIALTY;
            buildedMessages.push(
              await this.updateAndBuildPatientMessage(findMessage),
            );
          } else {
            findMessage.step = STEPS.INSERT_DATE;
            buildedMessages.push(
              await this.updateAndBuildPatientMessage(findMessage),
            );
          }
        }

        break;
      case STEPS.INIT:
        findMessage.step = STEPS.SELECT_SPECIALTY;
        buildedMessages.push(
          await this.updateAndBuildPatientMessage(findMessage),
        );
        break;
      case STEPS.SELECT_SPECIALTY:
        findMessage.step = STEPS.INSERT_DATE;
        findMessage.speciality = infoMessage.content.title;
        buildedMessages.push(
          await this.updateAndBuildPatientMessage(findMessage),
        );
        break;
      case STEPS.INSERT_DATE:
        findMessage.step = STEPS.SELECT_DOCTOR;
        findMessage.date = stringToDate(infoMessage.content);
        const patientMessage =
          this.messageBuilder.searchingDoctorTemplateBuilder(
            infoMessage.clientPhone,
          );
        buildedMessages.push(patientMessage);
        await this.updateMessage(findMessage.id, findMessage);
        this.messageBuilder.buildDoctorNotification(findMessage);
        break;
      case STEPS.SELECT_DOCTOR:
        findMessage.step = STEPS.SELECT_PAYMENT;
        try {
          const doctor = await this.doctorService.findById(
            infoMessage.content.id,
          );
          findMessage.doctorPhone = doctor.phone;
          findMessage.doctorId = doctor._id;
          findMessage.fee = doctor.fee;
          const appointment = await createAppointment(findMessage);
          findMessage.appointmentId = appointment._id;
          buildedMessages.push(
            await this.updateAndBuildPatientMessage(findMessage),
          );

        } catch (error) {
          console.log("erro creating appointment", error);
        }
        break;
      case STEPS.SELECT_PAYMENT:
        findMessage.step = STEPS.SUBMIT_VOUCHER;
        buildedMessages.push(
          await this.updateAndBuildPatientMessage(findMessage),
        );
        break;
      case STEPS.SUBMIT_VOUCHER:
        findMessage.step = STEPS.SEND_CONFIRMATION;
        const waitingMessage = await this.updateAndBuildPatientMessage(
          findMessage,
        );
        buildedMessages.push(waitingMessage);
        await this.sendVoucherImage(infoMessage.content, findMessage);
        break;
      default:
        return false;
    }
    return buildedMessages;
  }

  async sendVoucherImage(image: string, message: Message) {
    const getImage = await fetch(`https://graph.facebook.com/v16.0/${image}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
      },
    });
    const imageUrl = await getImage.json();
    try {
      const imageData = await axios.get(imageUrl.url, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
        },
      });
      const imageBuffer = Buffer.from(imageData.data, 'binary');
      const mimeType = imageData.headers['content-type'];
      const base64Image = imageBuffer.toString('base64');

      const uploadResponse = await axios.post(
        `${process.env.API_SERVICE}/cloudinary/uploadbuffer`,
        {
          imageBuffer: `data:${mimeType};base64,${base64Image}`,
        },
      );
      message.imageVoucher = uploadResponse.data.imageUrl.secure_url;
      await this.updateMessage(message.id, message);
    } catch (error) {
      console.error('Error al obtener la imagen:', error);
    }
  }

  async doctorMessageHandler(infoMessage: IParsedMessage, message: Message) {
    if (message.step === STEPS.SELECT_DOCTOR) {
      const doctor = await this.doctorService.findByPhone(
        infoMessage.clientPhone,
      );
      message.doctorPhone = doctor[0].phone;
      message.doctorId = doctor[0]._id;
      message.fee = doctor[0].fee;
      return [this.messageBuilder.buildMessage(message)];
    }
    return false;
  }

  createStatusNotification(message: Message) {
    const messages = [];
    const date = message.date;
    if (message.status === '2') {
      messages.push(
        this.messageBuilder.buildConfirmationNotification(date, message.phone),
        this.messageBuilder.buildConfirmationNotification(
          date,
          message.doctorPhone,
        ),
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
    await this.updateMessage(message.id, message);
    return this.messageBuilder.buildMessage(message);
  }

  //   console.log("iniciando para los otros pasos")
  //   switch(messageExist.step){
  //     // VERIFICO EL PASO QUE SE ENCUENTRA EL USUARIO
  //     case STEPS.INIT:
  //       messageParsed.step = STEPS.SELECT_SPECIALTY;
  //       const updateMessage = this.updateMessage(messageParsed);
  //       console.log("aqui updateMessage",updateMessage)
  //       return messageParsed;
  //     case STEPS.INSERT_DATE:
  //       break;
  //     case STEPS.SELECT_DOCTOR:
  //       break;
  //     case STEPS.SELECT_PAYMENT:
  //       break;
  //     case STEPS.SUBMIT_VOUCHER:
  //       break;
  //     case STEPS.SEND_CONFIRMATION:
  //       break;
  //     default:
  //       return messageParsed;
  //   }
  // }
  // else{
  //   if(messageExist){
  //     return messageExist;
  //   }
  //   const newMessage = await this.create(messageParsed);
  //   // responder con el mensaje de bienvenida
  //   console.log("aquiiiiiiiiiiii",newMessage)
  //   return newMessage;

  // }
  // return messageParsed;

  // }
  // catch(error){
  //   this.handleExceptions(error);
  // }

  // }

  // extractInfo(message: any){
  //     // nameCient
  //     // phoneClient
  //     // type
  //     // contenido de mensaje(considerar id y textos)
  //     // return  {
  //             // nameCient
  //     // phoneClient
  //     // type
  //     // }
  // }

  // async createDirect(createMessageDto: CreateMessageDto) {
  //   try{
  //     const message = await this.messageModel.create(createMessageDto);
  //     return message;
  //   }
  //   catch(error){
  //     this.handleExceptions(error);
  //   }

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
    const getPatient = await axios.get(
      `${process.env.API_SERVICE}/patient/findorcreate?phone=${receivedMessage.clientPhone}&name=${receivedMessage.clientName}`,
    );
    const patient = getPatient.data;
    const message = await this.messageModel.findOne({
      phone: receivedMessage.clientPhone,
    });
    if (!message) {
      const createMessage = new this.messageModel({
        clientId: patient._id,
        phone: receivedMessage.clientPhone,
        clientName: patient.name,
        doctor: '',
      });
      await createMessage.save();
      return createMessage;
    }

    return message;
  }

  async create(createMessageDto: any) {
    try {
      const message = await this.messageModel.create(createMessageDto);
      return message;
    } catch (error) {
      this.handleExceptions(error);
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

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        'Doctor ya existe' + JSON.stringify(error.keyValue),
      );
    }
    throw new InternalServerErrorException(
      'Error creando doctor' + JSON.stringify(error),
    );
  }
}
