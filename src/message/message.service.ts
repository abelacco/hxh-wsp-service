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
    private readonly doctorService: DoctorService
  ) {}

  // async proccessMessage(messageFromWSP: any) {

  //   // validar si es un mensaje valido
  //   const validMessage = this.validateMessage(messageFromWSP);
  //   console.log("aqui",validMessage)
  //   if(!validMessage.valid){
  //     return false;
  //   }

  //   const messageParsed = this.parseMesssageFromWSP(validMessage.messageInfo);

  //   if(validMessage.messageInfo.type === 'text' && (validMessage.messageInfo.text.body).toUpperCase() === 'RESET' ){
  //     messageParsed.step = STEPS.INIT;
  //     const updatedMessage = await this.updateMessage(messageParsed);
  //   }

  //   const messageExist = await this.findOne(messageParsed.phone);
  //   console.log("aqui messageExist",messageExist)
  //   try{
  //     if(!messageExist){
  //        // Si el mensaje no existe en la base de datos, lo creas con el paso STEPS.INIT
  //        console.log("Mensaje no existe")
  //        const newMessage = await this.create(messageParsed);
  //        console.log("Mensaje creado:");
  //        return {
  //         message: newMessage,
  //         responseClient: validMessage.response
  //       }
  //     } else {
  //       let updatedMessage:any;
  //       switch(messageExist.step){
  //         // VERIFICO EL PASO QUE SE ENCUENTRA EL USUARIO
  //         case STEPS.INIT:
  //           console.log("Entre al switch INIT")

  //           if (validMessage.type === 'interactive') {
  //             messageParsed.step = STEPS.SELECT_SPECIALTY;
  //             const updatedMessage = await this.updateMessage(messageParsed);
  //             console.log("Mensaje actualizado:", updatedMessage);
  //             return {
  //               message: updatedMessage,
  //               responseClient: validMessage.response
  //             }
  //           } else {
  //             return {
  //               message: messageExist,
  //               responseClient: validMessage.response
  //             };
  //           }
  //         case STEPS.SELECT_SPECIALTY:
  //           messageParsed.step = STEPS.INSERT_DATE;
  //           updatedMessage = await this.updateMessage(messageParsed);
  //           return {
  //             message: updatedMessage,
  //             responseClient: validMessage.response
  //           };
  //           case STEPS.INSERT_DATE:
  //             messageParsed.step = STEPS.SELECT_DOCTOR;
  //             updatedMessage = await this.updateMessage(messageParsed);
  //             return {
  //               message: updatedMessage,
  //               responseClient: validMessage.response
  //             };
  //           case STEPS.SELECT_DOCTOR:
  //             messageParsed.step = STEPS.SELECT_PAYMENT;
  //             updatedMessage = await this.updateMessage(messageParsed);
  //             return {
  //               message: updatedMessage,
  //               responseClient: validMessage.response
  //             };
  //           case STEPS.SELECT_PAYMENT:
  //             messageParsed.step = STEPS.SUBMIT_VOUCHER;
  //             updatedMessage = await this.updateMessage(messageParsed);
  //             return {
  //               message: updatedMessage,
  //               responseClient: validMessage.response
  //             };
  //           case STEPS.SUBMIT_VOUCHER:
  //             messageParsed.step = STEPS.SEND_CONFIRMATION;
  //             updatedMessage = await this.updateMessage(messageParsed);
  //             return {
  //               message: updatedMessage,
  //               responseClient: validMessage.response
  //             };
  //           default:
  //             return {
  //               message: messageExist,
  //               responseClient: validMessage.response
  //             };

  //       }
  //     //   console.log("iniciando para los otros pasos")
  //     //   switch(messageExist.step){
  //     //     // VERIFICO EL PASO QUE SE ENCUENTRA EL USUARIO
  //     //     case STEPS.INIT:
  //     //       messageParsed.step = STEPS.SELECT_SPECIALTY;
  //     //       const updateMessage = this.updateMessage(messageParsed);
  //     //       console.log("aqui updateMessage",updateMessage)
  //     //       return messageParsed;
  //     //     case STEPS.INSERT_DATE:
  //     //       break;
  //     //     case STEPS.SELECT_DOCTOR:
  //     //       break;
  //     //     case STEPS.SELECT_PAYMENT:
  //     //       break;
  //     //     case STEPS.SUBMIT_VOUCHER:
  //     //       break;
  //     //     case STEPS.SEND_CONFIRMATION:
  //     //       break;
  //     //     default:
  //     //       return messageParsed;
  //     //   }
  //     // }
  //     // else{
  //     //   if(messageExist){
  //     //     return messageExist;
  //     //   }
  //     //   const newMessage = await this.create(messageParsed);
  //     //   // responder con el mensaje de bienvenida
  //     //   console.log("aquiiiiiiiiiiii",newMessage)
  //     //   return newMessage;

  //     // }
  //     // return messageParsed;
  //     }
  //   }
  //   catch(error){
  //     this.handleExceptions(error);
  //   }

  // }
  async proccessMessage(messageFromWSP: WspReceivedMessageDto) {
    // validar si existe algun mensaje en la db
    const infoMessage = messageDestructurer(messageFromWSP);
    if (!DoctorMessageValidator(infoMessage)) {
      const findMessage = await this.findOrCreateMessage(infoMessage);
      return await this.patientPath(infoMes;sage, findMessage)
    } else {
      const getMessageResponded = await this.findById(infoMessage.content.id.split('-')[1]);
      return this.doctorResponse(infoMessage, getMessageResponded);
    }
  }

  async patientPath(infoMessage: IParsedMessage, findMessage: Message) {
    const validateStep = receivedMessageValidator(
      findMessage.step,
      infoMessage,
    );
    if (!validateStep) return false;
    // validar en que paso estamod
    const buildedMessages = [];
    switch (findMessage.step) {
      // VERIFICO EL PASO QUE SE ENCUENTRA EL USUARIO
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
        const doctors = await this.doctorService.notifyDoctor(findMessage);
        doctors.forEach((doc) => buildedMessages.push(doc));
        await this.updateMessage(findMessage.id, findMessage);
        break;
      case STEPS.SELECT_DOCTOR:
        findMessage.step = STEPS.SELECT_PAYMENT;
        findMessage.doctor = infoMessage.content.id
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
        break;
      default:
        return false;
    }
    return buildedMessages;
  }

  doctorResponse(infoMessage: IParsedMessage, message: Message) {
    if (
      message.step === STEPS.SELECT_DOCTOR
    ) {
      message.doctor = infoMessage.clientPhone;
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
    // find
    // create(conditional)
    // return message
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
