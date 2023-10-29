import { STEPS } from "src/config/constants";
import { Templates } from "./templates/textTemplate";
import { Message } from "../entities/message.entity";

export const messageErrorHandler = (message: Message) => {
    const step = message.step;
    const patientPhone = message.phone;
    switch (step) {
        case STEPS.SELECT_SPECIALTY:
            return Templates.generateSpecialitiesList(patientPhone);
        case STEPS.INSERT_DATE:
            return Templates.dateStepTemplateMessage(patientPhone);
        case STEPS.SELECT_DOCTOR:
            return Templates.defaultMessageTemplate(patientPhone);
        case STEPS.SELECT_PAYMENT:
            return Templates.generatePaymentOptions(patientPhone);
        case STEPS.SUBMIT_VOUCHER:
            return Templates.defaultMessageTemplate(patientPhone);
        default:
            return Templates.defaultMessageTemplate(patientPhone);
    }
}