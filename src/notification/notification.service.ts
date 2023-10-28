import { Injectable } from '@nestjs/common';
import { Message } from 'src/message/entities/message.entity';

@Injectable()
export class NotificationService {
  // constructor(private readonly messageService: MessageService) {}
  
  async sendNotification(message: any) {
    fetch(`https://graph.facebook.com/v16.0/${process.env.PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(message),
    });
  }

  async statusNotification(message: Message) {
    
  }
}
