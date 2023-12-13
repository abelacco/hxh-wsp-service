import { BadRequestException, Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PAYMENTSTATUS, STEPS } from '../config/constants';
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
import { ClientsService } from 'src/clients/clients.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly messageBuilder: BotResponseService,
    private readonly clientHandlerService: ClientHandlerService,
    private readonly clientsService: ClientsService,
  ) { }

  public async processMessage(messageFromWSP: IParsedMessage): Promise<any> {
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

  private async findById(id: string): Promise<Message> {
    // Se debe crar una capa de servicios para hacer consultas a la base de datos
    const message = await this.messageModel.findById(id);
    return message;
  }


  private async findOrCreateMessage({ clientName, clientPhone }): Promise<Message> {
    Logger.log('FINDORCEATEMESSAGE','MESSAGE')
    // Vamos a verificar si el cliente existe en la base de datos
    const client = await this.clientsService.findOrCreateClient(clientPhone, clientName);    
    //Busca mensaje por número de cliente
    const message = await this.messageModel.findOne({
      clientPhone: clientPhone,
      $and: [
        {
          clientId: client._id,
        },
        {
          status: PAYMENTSTATUS.PENDING,
        },
      ]
    });
    Logger.log(`CURRENT MESSAGE FROM DB: ${client}`,'MESSAGE')

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

}






