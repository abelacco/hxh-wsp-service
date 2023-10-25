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
import { DoctorMessageValidator, receivedMessageValidator } from './helpers/receivedMessageValidator';
import { DoctorService } from 'src/doctor/doctor.service';
@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly messageBuilder: BotResponseService,
    private readonly doctorService: DoctorService,
  ) {}

  async proccessMessage(messageFromWSP: WspReceivedMessageDto) {
    /*
      Get required info of the received message
    */
    console.log("mensaje recibido: ", messageFromWSP)
    const infoMessage = messageDestructurer(messageFromWSP);
    console.log("mensaje parseado: ", infoMessage)

    /*
      Verify if it's a doctor response or
      a patient message
    */
    if (!DoctorMessageValidator(infoMessage)) {
      const findMessage = await this.findOrCreateMessage(infoMessage);
      return await this.patientMessageHandler(infoMessage, findMessage);
    } else {
      const getMessageResponded = await this.findById(infoMessage.content.id.split('-')[1]);

      return this.doctorMessageHandler(infoMessage, getMessageResponded);
    }
  }

  async patientMessageHandler(infoMessage: IParsedMessage, findMessage: Message) {
    const buildedMessages = [];
    /*
      Reset the information of the patient message
    */
    if(infoMessage.type === 'text' && (infoMessage.content).toUpperCase() === 'RESET'){
      findMessage.step = STEPS.SELECT_SPECIALTY;
      findMessage.speciality = '';
      findMessage.doctor = '';
      findMessage.date = null;
      buildedMessages.push(await this.updateAndBuildPatientMessage(findMessage));
      return buildedMessages;
    }

    const validateStep = receivedMessageValidator(
      findMessage.step,
      infoMessage,
    );
    console.log('validacion: ', validateStep)
    if (!validateStep) return false;
    switch (findMessage.step) {
      /*
        Handle what message template would be returned
        according to the step
      */
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
        findMessage.date = infoMessage.content;
        const patientMessage = this.messageBuilder.searchingDoctorTemplateBuilder(infoMessage.clientPhone);
        buildedMessages.push(patientMessage);
        await this.updateMessage(findMessage.id, findMessage);
        this.messageBuilder.buildDoctorNotification(findMessage);
        break;
      case STEPS.SELECT_DOCTOR:
        findMessage.step = STEPS.SELECT_PAYMENT;
        findMessage.doctor = infoMessage.content.id
        const doctor = await this.doctorService.findByPhone(infoMessage.content.id);
        findMessage.fee = doctor[0].fee;
        buildedMessages.push(
          await this.updateAndBuildPatientMessage(findMessage),
        );
        break;
      case STEPS.SELECT_PAYMENT:
        findMessage.step = STEPS.SUBMIT_VOUCHER;
        buildedMessages.push(
          await this.updateAndBuildPatientMessage(findMessage),
        );
        break;
      case STEPS.SUBMIT_VOUCHER:
        findMessage.step = STEPS.SEND_CONFIRMATION;
        buildedMessages.push(
          await this.updateAndBuildPatientMessage(findMessage),
        );
        break;
      case STEPS.SEND_CONFIRMATION:
        console.log("entro en el switch");
        buildedMessages.push(this.messageBuilder.buildMessage(findMessage));
        buildedMessages.push(this.messageBuilder.buildConfirmationNotification(infoMessage.clientPhone));
        //await this.sendVoucherImage(infoMessage.content, findMessage);
        break;
      default:
        return false;
    }
    return buildedMessages;
  }

  // async sendVoucherImage(image: string, mesage: Message) {
  //   const request = await fetch('general-service-api', {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       image: image
  //     })
  //   })
  //   const response = await request.json();
  //   message.imageVoucher = response.url;
  //   await this.updateMessage(mesage.id, message);
  // }



  async doctorMessageHandler(infoMessage: IParsedMessage, message: Message) {

    if (
      message.step === STEPS.SELECT_DOCTOR
    ) {
      message.doctor = infoMessage.clientPhone;
      const doctor = await this.doctorService.findByPhone(infoMessage.clientPhone);
      message.fee = doctor[0].fee;
      return [this.messageBuilder.buildMessage(message)];
    }
    return false;
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

  async findOrCreateMessage(receivedMessage: IParsedMessage): Promise<Message> {
    /*
      Find or create a new message
      Receive a parsed message
    */
    const message = await this.messageModel.findOne({
      phone: receivedMessage.clientPhone,
    });
    if (!message) {
      const createMessage = new this.messageModel({
        phone: receivedMessage.clientPhone,
        clientName: receivedMessage.clientName,
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
