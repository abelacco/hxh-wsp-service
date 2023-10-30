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
    await fetch(`${api}/appointment`, {
        method: "POST",
        body: JSON.stringify({appointment}),
    })
}