import {  Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PAYMENTSTATUS, STEPS } from 'src/message/helpers/constants';
import { BotResponseService } from './bot-response/bot-response.service';
import {ProviderMessageValidator,} from './helpers/receivedMessageValidator';
import { IParsedMessage } from 'src/wsp/entities/parsedMessage';
import { Logger } from '@nestjs/common';

const logger = new Logger('MessageService');
import { ClientHandlerService } from './client-handler/client-handler.service';
import { ClientsService } from 'src/general-services/clients.service';
import { PaymentStatusDto } from 'src/wsp/dto/paymentStatus.dto';
import { MongoDbService } from './db/mongodb.service';
import { IMessageDao } from './db/messageDao';

@Injectable()
export class MessageService {
  private readonly _db: IMessageDao;
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly messageBuilder: BotResponseService,
    private readonly clientHandlerService: ClientHandlerService,
    private readonly clientsService: ClientsService,
    private readonly _mongoDbService: MongoDbService,
  ) { 
    this._db = this._mongoDbService;
  }

  public async processMessage(entryMessage: IParsedMessage): Promise<any> {
    Logger.log('INICIO DE PROCESAR MENSAJE', 'MESSAGE');
    Logger.log(`${this.isProviderMessage(entryMessage)}`, 'MESSAGE');

    // Determinar si el mensaje es del proveedor o del cliente
    if (this.isProviderMessage(entryMessage)) {
      return this.handleProviderMessage(entryMessage);
    } else {
      const currentMessage = await this.findOrCreateMessage(entryMessage);
      return this.clientHandlerService.handleClientMessage(entryMessage, currentMessage);
      // return this.handleClientMessage(messageFromWSP);
    }
  }

  private isProviderMessage(entryMessage: IParsedMessage): boolean {
    // Lógica para determinar si el mensaje es del proveedor
    return ProviderMessageValidator(entryMessage);
  }

  private async handleProviderMessage(entryMessage: IParsedMessage) {
    // Se extrae el id del cliente que esta en el boton cuando un proveedor acepta la disponibilidad y se busca el ultimo 
    //mensaje o carrito de compras
    const getMessageResponded = await this.findById(
      entryMessage.content.id.split('-')[1],
    );

    if (getMessageResponded.step === STEPS.SELECT_PROVIDER && !getMessageResponded.providerId) {
      return [await this.messageBuilder.buildProviderCard(entryMessage.clientPhone, getMessageResponded)];
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
          clientName: client.name || null,
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

    async updateStatus(paymentStatusDto: PaymentStatusDto) {
      try {
        await this.clientHandlerService.updateStatus(paymentStatusDto); 
      } catch (error) {
        logger.error(error);
        throw error;
      }
  }

}






