import { SPECIAL_WORDS, STEPS } from 'src/message/helpers/constants';
import { ID, WSP_MESSAGE_TYPES , REPLIES_BUTTONS } from 'src/message/helpers/constants';
import { IParsedMessage } from 'src/wsp/entities/parsedMessage';
import { Message } from '../entities/message.entity';



// En esta función voy a recibir el paso en el que el carrito de compras se encuentra
// Si recibe que el carrito de compras esta en el paso init , entonces el mensaje que reciba debe ser de tipo texto
// Si recibe que el carrito de compras esta en el paso put_dni , entonces el mensaje que reciba debe ser de tipo texto o interactive
// Si recibe que el carrito de compras esta en el paso insert_date , entonces el mensaje que reciba debe ser de tipo texto o interactive
// Si recibe que el carrito de compras esta en el paso select_provider , entonces el mensaje que reciba debe ser de tipo interactive
// Si recibe que el carrito de compras esta en el paso select_payment , entonces el mensaje que reciba debe ser de tipo interactive
// Si recibe que el carrito de compras esta en el paso submit_voucher , entonces el mensaje que reciba debe ser de tipo image
export const receivedMessageValidator = (
  currentStep: string,
  entryMessage: IParsedMessage,
) => {
  switch (currentStep) {
    case STEPS.INIT:
      if (isTextMessage(entryMessage)) {
        return true;
      }
      return false;
    case STEPS.SEND_GREETINGS:
      if (isInteractiveMessage(entryMessage) && (hasSpecificContentId(entryMessage, ID.FIND_PROVIDER) || hasSpecificContentId(entryMessage, ID.I_AM_PROVIDER))) {
        return true;
      }
      return false;
    case STEPS.PUT_DNI:
      if (isTextMessage(entryMessage) || (isInteractiveMessage(entryMessage) && (
        hasSpecificContentId(entryMessage,ID.ACCEPT_DNI)  ||
        hasSpecificContentId(entryMessage,ID.RETRY_DNI) 
      ))) {
        return true;
      }
      return false;
    case STEPS.INSERT_DATE:
      if (isTextMessage(entryMessage) ||
          (hasSpecificContentId(entryMessage,ID.CHOOSE_ANOTHER)   ||
            hasSpecificContentId(entryMessage,ID.ACCEPT_DATE)  
          )
        ) {
        return true;
      }
      return false;
    case STEPS.SELECT_PROVIDER:
      if (
        isInteractiveMessage(entryMessage) &&
        (entryMessage.content.title === REPLIES_BUTTONS.SELECT_PROVIDER ||
          hasSpecificContentId(entryMessage,ID.ACEPT_PROVIDER)   ||
          hasSpecificContentId(entryMessage,ID.CHOOSE_ANOTHER) )
      ) {
        return true;
      }
      return false;
    case STEPS.SELECT_PAYMENT:
      if (
        isInteractiveMessage(entryMessage) &&
        REPLIES_BUTTONS.PAYMENTS_OPTIONS.some((opt) => opt === entryMessage.content.title)
      ) {
        return true;
      }
      return false;
    case STEPS.SUBMIT_VOUCHER:
      if (entryMessage.type === WSP_MESSAGE_TYPES.IMAGE) {
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
    infoMessage.content.title === REPLIES_BUTTONS.PROVIDER_ACCEPT &&
    infoMessage.content.id?.split('-')[0] === ID.PROVIDER_ACCEPT_ID
  ) {
    return true;
  }
  return false;
};

// export const isResetMessage = (infoMessage: IParsedMessage): boolean => infoMessage.content.id === ID.RESET;


export const isInteractiveMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type === WSP_MESSAGE_TYPES.INTERACTIVE;

export const isTextMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type ===  WSP_MESSAGE_TYPES.TEXT;

export const isImageMessage = (infoMessage: IParsedMessage): boolean => infoMessage.type === WSP_MESSAGE_TYPES.IMAGE;

export const hasSpecificContentId = (infoMessage: IParsedMessage, expectedId: string): boolean =>  infoMessage.content.id === expectedId;

export const hasSpecificTitle = (infoMessage: IParsedMessage, expectedTitle: string): boolean => infoMessage.content.title.toUpperCase() === expectedTitle;

// export const hasSpecificContentType = (infoMessage: IParsedMessage, expectedType: string): boolean => infoMessage.type === expectedType;

export const clientHasDni = (infoMessage: Message): boolean => infoMessage.dni !== null;

export const isResetMessage = (entryMessage: IParsedMessage): boolean => {
  const contentUpperCase = entryMessage.content.toUpperCase();
  return contentUpperCase === SPECIAL_WORDS.RESET &&
         (isTextMessage(entryMessage) || 
          isInteractiveMessage(entryMessage) && hasSpecificTitle(entryMessage, SPECIAL_WORDS.RESET));
};




