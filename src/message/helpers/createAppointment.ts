import axios from "axios";
import { CreateAppointmentDto } from "../dto/create-appointment.dto"
import { Message } from "../entities/message.entity"

export const createAppointment = async (message: Message) => {
    const appointment = new CreateAppointmentDto(
        message.clientId,
        message.doctorId,
        message.fee,
        message.date,
    );
    const api = process.env.API_SERVICE
    const query = await axios.post(`${api}/appointment`, {
        ...appointment
    })
    const response = query.data;

    return response;
}