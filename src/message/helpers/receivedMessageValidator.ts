import { STEPS } from 'src/config/constants';
import { WSP_REPLIES, SPECIALITIES, REPLIES_IDs } from './constants';
import { dateValidator } from './dateValidator';
import { WSP_MESSAGE_TYPES } from 'src/wsp/helpers/constants';
import { IParsedMessage } from 'src/wsp/entities/parsedMessage';

const { TEXT, INTERACTIVE, IMAGE } = WSP_MESSAGE_TYPES;
const { SELECT_DOCTOR, PAYMENTS_OPTIONS, DOCTOR_ACCEPT } = WSP_REPLIES;
const { DOCTOR_ACCEPT_ID } = REPLIES_IDs;

export const receivedMessageValidator = (
  step: string,
  infoMessage: IParsedMessage,
) => {
  switch (step) {
    case STEPS.INIT:
      if (
        infoMessage.type === TEXT ||
        (infoMessage.type === INTERACTIVE &&
          infoMessage.content.title.includes('especialidades'))
      ) {
        return true;
      }
      return false;
    case STEPS.SELECT_SPECIALTY:
      if (
        infoMessage.type === INTERACTIVE &&
        (infoMessage.content.id === 'retry_speciality' ||
          infoMessage.content.id === 'accpt_speciality' ||
          SPECIALITIES.some((s) => s === infoMessage.content.title))
      ) {
        return true;
      }
      return false;
    case STEPS.INSERT_DATE:
      if (infoMessage.type === TEXT) {
        return true;
      }
      return false;
    case STEPS.SELECT_DOCTOR:
      if (
        infoMessage.type === INTERACTIVE &&
        (infoMessage.content.title === SELECT_DOCTOR ||
          infoMessage.content.id === 'accpt_doctor')
      ) {
        return true;
      }
      return false;
    case STEPS.SELECT_PAYMENT:
      if (
        infoMessage.type === INTERACTIVE &&
        PAYMENTS_OPTIONS.some((opt) => opt === infoMessage.content.title)
      ) {
        return true;
      }
      return false;
    case STEPS.SUBMIT_VOUCHER:
      if (infoMessage.type === IMAGE) {
        return true;
      }
      return false;
    default:
      return false;
  }
};

export const DoctorMessageValidator = (infoMessage: IParsedMessage) => {
  if (
    infoMessage.type === INTERACTIVE &&
    infoMessage.content.title === DOCTOR_ACCEPT &&
    infoMessage.content.id?.split('-')[0] === DOCTOR_ACCEPT_ID
  ) {
    return true;
  }
  return false;
};
