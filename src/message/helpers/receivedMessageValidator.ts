import { STEPS } from "src/config/constants";
import { IParsedMessage } from "../entities/parsedMessage";

const specialities = [
    'Psicología',
    'Cardiología',
    'Medicina General',
    'Nutrición',
    'Ginecología',
  ];
  
  export const receivedMessageValidator = (step: string, infoMessage: IParsedMessage) => {
    switch (step) {
      case STEPS.INIT:
        if (
          infoMessage.type === 'text' &&
          (infoMessage.content === 'Hola' ||
            infoMessage.content === 'necesito ayuda')
        ) {
          return true;
        }
        return false;
      case STEPS.SELECT_SPECIALTY:
        if (
          infoMessage.type === 'interactive' &&
          specialities.some((s) => s === infoMessage.content.title)
        ) {
          return true;
        }
        return false;
      case STEPS.INSERT_DATE:
        if (
          infoMessage.type === 'text' &&
          infoMessage.content === '01-10-23 10:00 am'
        ) {
          return true;
        }
        return false;
      case STEPS.SELECT_DOCTOR:
        if (
          infoMessage.type === 'interactive' &&
          infoMessage.content.title === 'Reservar cita'
        ) {
          return true;
        }
        return false;
      case STEPS.SELECT_PAYMENT:
        if (
          infoMessage.type === 'interactive' &&
          (infoMessage.content.title === 'Tarjeta' ||
            infoMessage.content.title === 'Yape/Plin')
        ) {
          return true;
        }
        return false;
      case STEPS.SUBMIT_VOUCHER:
        if (
          infoMessage.type === 'text' &&
          infoMessage.content === 'Listo'
        ) {
          return true;
        }
        return false;
      default:
        return false;
    }
  }