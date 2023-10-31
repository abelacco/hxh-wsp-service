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
    console.log("dto para crear appointment", appointment)
    const api = process.env.API_SERVICE
    await axios.post(`${api}/appointment`, {
        ...appointment
    })
}