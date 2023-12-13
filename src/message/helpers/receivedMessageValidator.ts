import { STEPS } from 'src/config/constants';
import { WSP_REPLIES, SPECIALITIES, REPLIES_IDs } from './constants';
import { ID, WSP_MESSAGE_TYPES } from 'src/wsp/helpers/constants';
import { IParsedMessage } from 'src/wsp/entities/parsedMessage';
import { Message } from '../entities/message.entity';

const { TEXT, INTERACTIVE, IMAGE } = WSP_MESSAGE_TYPES;
const { SELECT_PROVIDER, PAYMENTS_OPTIONS, DOCTOR_ACCEPT } = WSP_REPLIES;
const { DOCTOR_ACCEPT_ID } = REPLIES_IDs;


// En esta función voy a recibir el paso en el que el carrito de compras se encuentra
// Si recibe que el carrito de compras esta en el paso init , entonces el mensaje que reciba debe ser de tipo texto
// Si recibe que el carrito de compras esta en el paso put_dni , entonces el mensaje que reciba debe ser de tipo texto o interactive
// Si recibe que el carrito de compras esta en el paso insert_date , entonces el mensaje que reciba debe ser de tipo texto o interactive
// Si recibe que el carrito de compras esta en el paso select_provider , entonces el mensaje que reciba debe ser de tipo interactive
// Si recibe que el carrito de compras esta en el paso select_payment , entonces el mensaje que reciba debe ser de tipo interactive
// Si recibe que el carrito de compras esta en el paso submit_voucher , entonces el mensaje que reciba debe ser de tipo image
export const receivedMessageValidator = (
  step: string,
  infoMessage: IParsedMessage,
) => {
  switch (step) {
    case STEPS.INIT:
      if (isTextMessage(infoMessage)) {
        return true;
      }
      return false;
    case STEPS.SEND_GREETINGS:
      if (isInteractiveMessage(infoMessage) && (hasSpecificContentId(infoMessage, ID.FIND_PROVIDER) || hasSpecificContentId(infoMessage, ID.I_AM_PROVIDER))) {
        return true;
      }
      return false;
    case STEPS.PUT_DNI:
      if (isTextMessage(infoMessage) || (isInteractiveMessage(infoMessage) && (
        hasSpecificContentId(infoMessage,ID.ACCEPT_DNI)  ||
        hasSpecificContentId(infoMessage,ID.RETRY_DNI) 
      ))) {
        return true;
      }
      return false;
    case STEPS.INSERT_DATE:
      if (isTextMessage(infoMessage) ||
          (hasSpecificContentId(infoMessage,ID.CHOOSE_ANOTHER)   ||
            hasSpecificContentId(infoMessage,ID.ACCEPT_DATE)  
          )
        ) {
        return true;
      }
      return false;
    case STEPS.SELECT_PROVIDER:
      if (
        isInteractiveMessage(infoMessage) &&
        (infoMessage.content.title === SELECT_PROVIDER ||
          hasSpecificContentId(infoMessage,ID.ACEPT_PROVIDER)   ||
          hasSpecificContentId(infoMessage,ID.CHOOSE_ANOTHER) )
      ) {
        return true;
      }
      return false;
    case STEPS.SELECT_PAYMENT:
      if (
        isInteractiveMessage(infoMessage) &&
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
    isInteractiveMessage(infoMessage) &&
    infoMessage.content.title === DOCTOR_ACCEPT &&
    infoMessage.content.id?.split('-')[0] === DOCTOR_ACCEPT_ID
  ) {
    return true;
  }
  return false;
};

export const isResetMessage = (infoMessage: IParsedMessage): boolean => infoMessage.content.id === ID.RESET;


export const isInteractiveMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type === INTERACTIVE;

export const isTextMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type === TEXT;

export const isImageMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type === IMAGE;

export const hasSpecificContentId = (infoMessage: IParsedMessage, expectedId: string): boolean =>  infoMessage.content.id === expectedId;

export const hasSpecificTitle = (infoMessage: IParsedMessage, expectedTitle: string): boolean => infoMessage.content.title.toUpperCase() === expectedTitle;

// export const hasSpecificContentType = (infoMessage: IParsedMessage, expectedType: string): boolean => infoMessage.type === expectedType;

export const clientHasDni = (infoMessage: Message): boolean => infoMessage.dni !== null;


