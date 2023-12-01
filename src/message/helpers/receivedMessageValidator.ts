import { STEPS } from 'src/config/constants';
import { WSP_REPLIES, SPECIALITIES, REPLIES_IDs } from './constants';
import { ID, WSP_MESSAGE_TYPES } from 'src/wsp/helpers/constants';
import { IParsedMessage } from 'src/wsp/entities/parsedMessage';

const { TEXT, INTERACTIVE, IMAGE } = WSP_MESSAGE_TYPES;
const { SELECT_DOCTOR, PAYMENTS_OPTIONS, DOCTOR_ACCEPT } = WSP_REPLIES;
const { DOCTOR_ACCEPT_ID } = REPLIES_IDs;

export const receivedMessageValidator = (
  step: string,
  infoMessage: IParsedMessage,
) => {
  console.log("infoMessage", step,infoMessage)
  switch (step) {
    case STEPS.PUT_DNI:
      console.log("entreeee")
      if (infoMessage.type === TEXT || (infoMessage.type === INTERACTIVE && (
        infoMessage.content.id === ID.ACCEPT_DNI||
        infoMessage.content.id === ID.RETRY_DNI
      ))) {
        return true;
      }
      return false;
    // case STEPS.SELECT_SPECIALTY:
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
      if (infoMessage.type === TEXT ||
          (infoMessage.content.id === ID.CHOOSE_ANOTHER ||
            infoMessage.content.id === ID.ACCEPT_DATE
          )
        ) {
        return true;
      }
      return false;
    case STEPS.SELECT_PROVIDER:
      if (
        infoMessage.type === INTERACTIVE &&
        (infoMessage.content.title === SELECT_DOCTOR ||
          infoMessage.content.id === ID.ACEPT_PROVIDER ||
          infoMessage.content.id === ID.CHOOSE_ANOTHER)
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

export const ProviderMessageValidator = (infoMessage: IParsedMessage) => {
  if (
    infoMessage.type === INTERACTIVE &&
    infoMessage.content.title === DOCTOR_ACCEPT &&
    infoMessage.content.id?.split('-')[0] === DOCTOR_ACCEPT_ID
  ) {
    return true;
  }
  return false;
};
