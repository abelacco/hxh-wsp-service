import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { STEPS } from '../config/constants';
import { info } from 'console';
@Injectable()
export class MessageService {

  constructor(
    @InjectModel(Message.name) 
    private readonly messageModel: Model<Message>,
    
    ) 
  {}

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
    async proccessMessage(messageFromWSP: any) {

    // validar si existe algun mensaje en la db 
    const infoMessage = this.extracInfo(messageFromWSP);
    const findMessage = this.findOrCreateMessage(infoMessage);
  
    // validar en que paso estamod 
    switch(findMessage.step){
          // VERIFICO EL PASO QUE SE ENCUENTRA EL USUARIO
          case STEPS.INIT:
            const validateStep = this.validateStepInfo(infoMessage);
            // si es true 
            // actualizar el paso 
            // llamar servicio para crear mensaje
           
            default:
              return {
                // message: messageExist,
                // responseClient: validMessage.response
              };
  
          
          
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
      
    }
    catch(error){
      // this.handleExceptions(error);
    }
  
  }

  // validateStepInfo(infoMessage: any){
  //       if(infoMessage.step === '0') {
  //         infoMessage.type === 'text
  //         infoMessage.response === 'Hola' || 'necesito ayuda'
  //         return true
  //       }
  //       else if(infoMessage.step === '1') {
  //         infoMessage.type === 'interactive
  //         infoMessage.response === validarEnUN array de especialidades si existe la que escogieron
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

  // findOrCreateMessage(phone: string){
  //   // find
  //   // create(conditional)
  //   // return message
  // }
  
  // async createDirect(createMessageDto: CreateMessageDto) {
  //   try{
  //     const message = await this.messageModel.create(createMessageDto);
  //     return message;
  //   }
  //   catch(error){
  //     this.handleExceptions(error);
  //   }
  // }


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
