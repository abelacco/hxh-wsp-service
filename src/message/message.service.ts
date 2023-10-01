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
    // console.log(JSON.stringify(messageFromWSP));
    // console.log(messageFromWSP);  
    // validar si es un mensaje valido
    const validMessage = this.validateMessage(messageFromWSP);
    console.log("aqui",validMessage)
    if(!validMessage.valid){
      console.log("no es valido");
      return false;
    }
    const messageParsed = this.parseMesssageFromWSP(validMessage.messageInfo);

    const messageExist = await this.findOne(messageParsed.phone);
    console.log("aqui",messageExist)
    try{
      if(messageExist && messageExist.step !== STEPS.INIT){
        
        switch(messageExist.step){
          
          case STEPS.SELECT_SPECIALTY:
            messageParsed.step = STEPS.SELECT_SPECIALTY;
            const updateMessage = this.updateMessage(messageParsed);
            console.log("aqui updateMessage",updateMessage)
            return messageParsed;
          case STEPS.INSERT_DATE:
            break;
          case STEPS.SELECT_DOCTOR:
            break;
          case STEPS.SELECT_PAYMENT:
            break;
          case STEPS.SUBMIT_VOUCHER:
            break;
          case STEPS.SEND_CONFIRMATION:
            break;
          default:
            return messageParsed;
        }
      }
      else{
        if(messageExist){
          return messageExist;
        }
        const newMessage = await this.create(messageParsed);
        // responder con el mensaje de bienvenida
        console.log("aquiiiiiiiiiiii",newMessage)
        return newMessage;

      }
      return messageParsed;
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
    // console.log("aqui entry",message.entry[0]);
    // console.log("aqui changes",message.entry[0].changes[0].value.messages[0]);
    // console.log("aqui contacnts",message.entry[0].changes[0].value.contacts[0]);
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
      valid: true
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
