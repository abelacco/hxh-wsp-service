import { Injectable } from '@nestjs/common';
import { WspQueriesDto } from './dto/queries-webhook';
import { MessageService } from 'src/message/message.service';
import { WspReceivedMessageDto } from 'src/message/dto/wspReceivedMessage.dto';
import { NotificationService } from 'src/notification/notification.service';
import { PaymentStatusDto } from './dto/paymentStatus.dto';
import axios from 'axios';

@Injectable()
export class WspService {
  constructor(
    private msgService: MessageService,
    private readonly notificationService: NotificationService
  ) {}
  async proccessMessage(messageWSP: WspReceivedMessageDto) {
    console.log('procesando mensaje');
    const response = await this.msgService.proccessMessage(messageWSP);
    if (!response) {
      return false;
    }

    for (const message of response) {
      await this.sendMessages(message)
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
    message.status = status;
    await this.msgService.updateMessage(message.id, message);
    console.log("message status", message)
    const templates = this.msgService.createStatusNotification(message);

    for (const template of templates) {
      this.sendMessages(template);
    }
  }

  async sendMessages(messageClient: any) {
    // const buildMessage = this.botResponse.buildMessage(messageClient);
    console.log('enviando mensaje, body: ', messageClient);
    // botResponse = '{ \"messaging_product\": \"whatsapp\", \"to\": \"51947308823\", \"type\": \"template\", \"template\": { \"name\": \"hello_world\", \"language\": { \"code\": \"en_US\" } } }'
    try {
      await axios.post(
        `https://graph.facebook.com/v16.0/${process.env.PHONE_ID}/messages`,messageClient,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  }
}
