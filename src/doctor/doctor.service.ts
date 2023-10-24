import { Injectable } from '@nestjs/common';
import { BotResponseService } from 'src/message/bot-response/bot-response.service';
import { Message } from 'src/message/entities/message.entity';

@Injectable()
export class DoctorService {
  constructor(private readonly messageBuilder: BotResponseService) {}

  findByPhone(doctorPhone: string) {
    const result = [];
    fetch(
      `${process.env.API_SERVICE}/doctor?phone=${doctorPhone}`,
    ).then(async (res) => {
      const getDoctors = await res.json();
      getDoctors.forEach((doc) => doc);
    });
    return result;
  }

  async buildDoctorNotification(message: Message) {
    const doctors = [];

    try {
      const res = await fetch(`${process.env.API_SERVICE}/doctor?speciality=${message.speciality}`);
      const getDoctors = await res.json();
      
      for (const doc of getDoctors) {
        const notification = this.messageBuilder.buildDoctorNotification(
          doc.phone,
          message.id,
          message.clientName,
        );
        doctors.push(notification);
      }
      return doctors;
    } catch (error) {
      console.error('Error notifying doctor:', error);
      throw error;
    }
    
  }
}
