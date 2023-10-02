import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { STEPS } from '../config/constants';
@Injectable()
export class MessageService {

  constructor(
    @InjectModel(Message.name) 
    private readonly messageModel: Model<Message>,
    
    ) 
  {}

  async proccessMessage(messageFromWSP: any) {

    // validar si es un mensaje valido
    const validMessage = this.validateMessage(messageFromWSP);
    console.log("aqui",validMessage)
    if(!validMessage.valid){
      console.log("no es valido");
      return false;
    }
    const messageParsed = this.parseMesssageFromWSP(validMessage.messageInfo);

    const messageExist = await this.findOne(messageParsed.phone);
    console.log("aqui messageExist",messageExist)
    try{
      if(!messageExist){
         // Si el mensaje no existe en la base de datos, lo creas con el paso STEPS.INIT
         console.log("Mensaje no existe")
         const newMessage = await this.create(messageParsed);
         console.log("Mensaje creado:");
         return {
          message: newMessage,
          responseClient: validMessage.response
        }
      } else {
        switch(messageExist.step){

          case STEPS.INIT:
            console.log("Entre al switch INIT")

            if (validMessage.type === 'interactive') {
              messageParsed.step = STEPS.SELECT_SPECIALTY;
              const updatedMessage = await this.updateMessage(messageParsed);
              console.log("Mensaje actualizado:", updatedMessage);
              return {
                message: updatedMessage,
                responseClient: validMessage.response
              }
            } else {
              return {
                message: messageExist,
                responseClient: validMessage.response
              };
            }
          case STEPS.SELECT_SPECIALTY:
            messageParsed.step = STEPS.INSERT_DATE;
            const updatedMessage = await this.updateMessage(messageParsed);
            return {
              message: updatedMessage,
              responseClient: validMessage.response
            };
          }
      }
      // if(messageExist && messageExist.step !== STEPS.INIT){
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
    }
    catch(error){
      this.handleExceptions(error);
    }
  }

  
  async createDirect(createMessageDto: CreateMessageDto) {
    try{
      const message = await this.messageModel.create(createMessageDto);
      return message;
    }
    catch(error){
      this.handleExceptions(error);
    }
  }

    async create(createMessageDto: any) {
    try{
      const message = await this.messageModel.create(createMessageDto);
      return message;
    }
    catch(error){
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all message`;
  }

  async findOne(phone: string) {
    const message = await this.messageModel.findOne({phone: phone});
    return message;
  }

  async updateMessage(messageParsed: any) {
    const updatedMessage = await this.messageModel.findOneAndUpdate({phone: messageParsed.phone}, messageParsed ,{ new: true });
    return updatedMessage;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }

  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException('Doctor ya existe' + JSON.stringify(error.keyValue));
    }
    throw new InternalServerErrorException('Error creando doctor' + JSON.stringify(error));
  }

  validateMessage(message: any){
    const messageInfo = message?.entry[0]?.changes[0]?.value?.messages[0];
    // console.log("messageInfo"), messageInfo;
    if(messageInfo && messageInfo.from === 'me')
    {
      return {
        messageInfo: messageInfo,
        valid: false
      };
    }
    return {
      messageInfo: messageInfo,
      valid: true,
      type: messageInfo.type,
      response: messageInfo.type === 'interactive' ? messageInfo.interactive : ''
    };;
  }

  parseMesssageFromWSP(message: any){
    const messageParsed = {
      phone: message.from,
      // message: message,
      step: STEPS.INIT,
      status: 'PENDING'
    }
    return messageParsed;
  }
}
