import { STEPS } from 'src/config/constants';
import { IParsedMessage } from '../entities/parsedMessage';
import { WSP_MESSAGE_TYPES, WSP_REPLIES, SPECIALITIES, REPLIES_IDs } from './constants';
import { dateValidator } from './dateValidator';

const { TEXT, INTERACTIVE } = WSP_MESSAGE_TYPES;
const { GREETING, SELECT_DOCTOR, PAYMENTS_OPTIONS, SUBMIT_VOUCHER, DOCTOR_ACCEPT, } = WSP_REPLIES;
const { DOCTOR_ACCEPT_ID } = REPLIES_IDs;

export const receivedMessageValidator = (
  step: string,
  infoMessage: IParsedMessage,
) => {
  switch (step) {
    case STEPS.INIT:
      if (
        infoMessage.type === TEXT &&
        (GREETING.some(text => text === infoMessage.content))
      ) {
        return true;
      }
      return false;
    case STEPS.SELECT_SPECIALTY:
      if (
        infoMessage.type === INTERACTIVE &&
        SPECIALITIES.some((s) => s === infoMessage.content.title)
      ) {
        return true;
      }
      return false;
    case STEPS.INSERT_DATE:
      if (
        infoMessage.type === TEXT &&
        dateValidator(infoMessage.content)
      ) {
        return true;
      }
      return false;
    case STEPS.SELECT_DOCTOR:
      if (
        infoMessage.type === INTERACTIVE &&
        infoMessage.content.title === SELECT_DOCTOR
      ) {
        return true;
      }
      return false;
    case STEPS.SELECT_PAYMENT:
      if (
        infoMessage.type === INTERACTIVE &&
        PAYMENTS_OPTIONS.some(opt => opt === infoMessage.content.title)
      ) {
        return true;
      }
      return false;
    case STEPS.SUBMIT_VOUCHER:
      if (infoMessage.type === TEXT && infoMessage.content === SUBMIT_VOUCHER) {
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
