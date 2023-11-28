import { Injectable, Logger } from '@nestjs/common';
import { WspQueriesDto } from './dto/queries-webhook';
import { MessageService } from 'src/message/message.service';
import { WspReceivedMessageDto } from 'src/message/dto/wspReceivedMessage.dto';
import { PaymentStatusDto } from './dto/paymentStatus.dto';
import axios from 'axios';
import { messageDestructurer } from './helpers/messageDestructurer';
import { WSP_MESSAGE_TYPES } from './helpers/constants';

@Injectable()
export class WspService {
  constructor(private msgService: MessageService) {}

  // Este metodo debe servir como handler de los mensajes que llegan desde WhatsApp
  async proccessMessage(messageWSP: WspReceivedMessageDto) {
    // Deberia queda 3 pasos
    // paso 1 deestructurar el mensaje
    // paso 2 enviar el mensaje al servicio de mensajeria
    // paso 3 enviar la respuesta al cliente
    Logger.log('Iniciando proceso de mensaje', 'WSP INIT');
    Logger.log(messageWSP.entry[0].changes[0].value, 'RAW MESSAGE');
    console.log("raw message", messageWSP.entry[0].changes[0].value)

    // Deestructurar mensaje
    const parsedMessage = messageDestructurer(messageWSP);
    //Valida si es una imagen
    // Esta validacion debería estar dentro del servicio de proccesMessage
    // Obtener link de wasap
    if (parsedMessage.type === WSP_MESSAGE_TYPES.IMAGE)
      parsedMessage.content = await this.getWhatsappMediaUrl(parsedMessage.content);
    // Envia el mensaje parseado al servicio de mensajeria
    const response = await this.msgService.proccessMessage(parsedMessage);
    Logger.log('Respuesta del bot')
    console.log('Resp', response);
    if (!response) {
      return false;
    }
    //Enviar respuesta a cliente 
    for (const message of response) {
      await this.sendMessages(message);
    }

    return 'This action adds a new wsp';
  }

  validateWebHook(wspQueries: WspQueriesDto) {
    const myVerifyToken = process.env.MY_VERIFY_TOKEN;
    const hubMode = wspQueries['hub.mode'];
    const challenge = wspQueries['hub.challenge'];
    const verifyToken = wspQueries['hub.verify_token'];

    if (hubMode === 'subscribe' && verifyToken === myVerifyToken) {
      return challenge;
    } else {
      throw new Error(
        'Failed validation. Make sure the validation tokens match.',
      );
    }
  }

  async updateStatus(paymentStatusDto: PaymentStatusDto) {
    const id = paymentStatusDto.id;
    const status = paymentStatusDto.status;
    const message = await this.msgService.findByAppointmentId(id);
    message.status = status.toString();
    await this.msgService.updateMessage(message.id, message);
    const templates = await this.msgService.createStatusNotification(message);

    for (const template of templates) {
      this.sendMessages(template);
    }
  }

  async sendMessages(messageClient: any) {
    // const buildMessage = this.botResponse.buildMessage(messageClient);
    console.log('enviando mensaje, body: ', messageClient);
    // botResponse = '{ \"messaging_product\": \"whatsapp\", \"to\": \"51947308823\", \"type\": \"template\", \"template\": { \"name\": \"hello_world\", \"language\": { \"code\": \"en_US\" } } }'
    try {
      const prueba = await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.PHONE_ID}/messages`,messageClient,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
          },
        },
      );
      console.log('prueba', prueba.data);
    
    } catch (error) {
      console.log(error);
    }
  }

  async getWhatsappMediaUrl(imageId: string) {
    const getImage = await axios.get(
      `https://graph.facebook.com/v16.0/${imageId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
        },
      },
    );
    const imageUrl = await getImage.data.url;
    return imageUrl;
  }
}
