import { Injectable } from '@nestjs/common';
import { BotResponseService } from 'src/message/bot-response/bot-response.service';
import { Message } from 'src/message/entities/message.entity';

@Injectable()
export class DoctorService {
  constructor(private readonly messageBuilder: BotResponseService) {}
  doctores = [
    {
      phone: "598918136011",
      fee: 500
    }
  ]
  async findByPhone(doctorPhone: string) {
    const result = [];
    fetch(
      `${process.env.API_SERVICE}/doctor?phone=${doctorPhone}`,
    ).then(async (res) => {
      const getDoctors = await res.json();
    });
    for (const doc of this.doctores) {
      result.push(doc)
    }
    return result;
  }

  async notifyDoctor(message: Message) {
    const doctors = [];
    

    // fetch(
    //   `${process.env.API_SERVICE}/doctor?speciality=${message.speciality}`,
    // ).then(async (res) => {
    //   const getDoctors = await res.json();
    //   console.log(getDoctors)
    //   getDoctors.forEach((doc) => {
    //     doctors.push(
    //       this.messageBuilder.buildDoctorNotification(
    //         doc.phone,
    //         message.id,
    //         message.clientName,
    //       ),
    //     );
    //     console.log('doctor', doctors)
    //   });
    // });
    // return doctors;

    try {
      const res = await fetch(`${process.env.API_SERVICE}/doctor?speciality=${message.speciality}`);
      const getDoctors = await res.json();
      
      for (const doc of this.doctores) {
        const notification = this.messageBuilder.buildDoctorNotification(
          doc.phone,
          message.id,
          message.clientName,
          message.date
        );
        doctors.push(notification);
      }
  
      console.log('doctor', doctors);
      return doctors;
    } catch (error) {
      console.error('Error notifying doctor:', error);
      throw error;
    }
    
  }
}
