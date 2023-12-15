import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateAppointmentDto } from 'src/message/dto';
import { PAYMENTSTATUS } from 'src/message/helpers/constants';

@Injectable()
export class AppointmentService {
    type: string = 'appointment';
    apiService: string = process.env.API_SERVICE;

    async createAppointment(message: any) {

      const appointment = new CreateAppointmentDto(
        message.clientId,
        message.providerId,
        message.fee,
        message.date,
        message.imageVoucher
    );

        try {
            const query = await axios.post(`${this.apiService}/${this.type}`, {
                ...appointment
            })
            const response = query.data;
            return response;

        } catch (error) {
            console.log(error.response.data.message[0]);
            throw new Error(error.response.data.message);
        }
    }

    async updateAppointment(appointmentId: string, voucher: string) {

      try {
       await axios.patch(
            `${this.apiService}/${this.type}/${appointmentId}`,
            {
              voucher,
              status: PAYMENTSTATUS.WAITING,
            },
          );
        return true;
      }
      catch (error) {
        console.log(error.response.data.message[0]);
        throw new Error(error.response.data.message);
      }
    
    }

    async getAppointment(appointmentId: string) {
      try {
        const query = await axios.get(`${this.apiService}/${this.type}/${appointmentId}`);
        const response = query.data;
        return response;
      } catch (error) {
        console.log(error.response.data.message[0]);
        throw new Error(error.response.data.message);
      }
    }
}
