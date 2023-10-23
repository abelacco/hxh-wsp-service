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

  async notifyDoctor(message: Message) {
    const doctors = [];

    fetch(
      `${process.env.API_SERVICE}/doctor?speciality=${message.speciality}`,
    ).then(async (res) => {
      const getDoctors = await res.json();
      console.log(getDoctors)
      getDoctors.forEach((doc) => {
        doctors.push(
          this.messageBuilder.buildDoctorNotification(
            doc.phone,
            message.id,
            message.clientName,
          ),
        );
      });
    });
    console.log('doctors', doctors)
    return doctors;
  }
}
