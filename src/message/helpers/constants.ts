
export const WSP_MESSAGE_TYPES = {
  TEXT: 'text',
  INTERACTIVE: 'interactive',
  IMAGE: 'image',
  BUTTON: 'button'
};

export const INTERACTIVE_REPLIES_TYPES = {
  BUTTON_REPLY: 'button_reply',
  LIST_REPLY: 'list_reply',
};


export const STEPS = {
  INIT: '0',
  SEND_GREETINGS: '1',
  PUT_DNI: '2',
  INSERT_DATE: '3',
  SELECT_PROVIDER: '4',
  SELECT_PAYMENT: '5',
  SUBMIT_VOUCHER: '6',
  SEND_CONFIRMATION: '7',
  INFO_FOR_NEW_PROVIDER: '8',
};

export const REPLIES_BUTTONS = {
  INTRODUCTION_TEMPLATE_A1: 'Buscar cuarto 🛏️',
  INTRODUCTION_TEMPLATE_A2: '⚕️ Soy Hotel',
  RESET_TEMPLATE: 'Reset',
  CONFIRMATION_ANSWER: 'Confirmar ✅',
  TRY_AGAIN_ANSWER: 'Volver a intentar 👀',
  CHOOSE_ANOTHER_ANSWER: 'Elegir otro 🔄',
  CHOOSE_ANOTHER_DATE_ANSWER: 'Otra fecha 📅',
  SELECT_PROVIDER: 'Reservar cita 🛒',
  ACCEPT: 'Aceptar ✅',
  GREETING: ['Hola', 'Necesito ayuda'],
  ACCEPT_APPOINTMENT: 'Aceptar',
  PAYMENTS_OPTIONS: ['Tarjeta 💳', 'Yape/Plin 📱'],
  SUBMIT_VOUCHER: 'Listo',
  PROVIDER_ACCEPT: 'Aceptar ✅',
}

export const ID = {
  ACEPT_PROVIDER: 'acpt_prvdr',
  CHOOSE_ANOTHER: 'chse_anthr',
  ACCEPT_DATE: 'accpt_date',
  PAYMENT_OPTIONS_YAPE: 'UNIQUE_BUTTON_ID_1',
  FIND_PROVIDER: 'find_provider',
  SUSCRIBE_PROVIDER: 'suscribe_provider',
  RESET: 'button_reset_id',
  ACCEPT_DNI: 'accpt_dni',
  RETRY_DNI: 'retry_dni',
  I_AM_PROVIDER: 'i_am_provider',
  PROVIDER_ACCEPT_ID : "accptcta",
}

export const SPECIAL_WORDS = {
  RESET: 'RESET',
}

// Estos status tambien los usamos para el modelo de mensajes
export enum PAYMENTSTATUS {
  PENDING = 0,
  WAITING = 1,
  ACCEPTED = 2,
  REJECTED = 3,
}

export enum MODALITY {
  ON_SITE = 0,
  REMOTE =1,
}

