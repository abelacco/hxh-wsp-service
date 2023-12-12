import axios from "axios";
import { CreateAppointmentDto } from "../dto/create-appointment.dto"
import { Message } from "../entities/message.entity"

export const createAppointment = async (message: Message) => {
    const appointment = new CreateAppointmentDto(
        message.clientId,
        message.providerId,
        message.fee,
        message.date,
        message.imageVoucher
    );
    const api = process.env.API_SERVICE
    try {
        const query = await axios.post(`${api}/appointment`, {
            ...appointment
        })
        const response = query.data;
        return response;

    } catch (error) {
        console.log(error.response.data.message[0]);
        throw new Error(error.response.data.message);  
    }

}