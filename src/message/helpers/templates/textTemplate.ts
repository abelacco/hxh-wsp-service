import { ID, REPLIES_BUTTONS } from "src/message/helpers/constants";
import { dateToString } from "../dateParser";

export class Templates {
  static dateStepTemplateMessage(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: `*ESTO ES UN BOT DE PRUEBA*  \n\nIngresa la fecha y hora que deseas tener tu RESERVA🕜 (DIA MES HORA MINUTOS AM/PM) \n\nEjemplo: *21 11 430 pm* \nEjemplo 2: *21 11 400 pm* \n\nRecuerda ingresar el turno por cada 30 minutos ☝️
        `,
      },
    };
  }

  static askForDniTemplate(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: '¡Genial! Por favor, ingresa tu DNI para registrarte ✅',
      },
    };
  }

  static botIntroductionTemplate(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `¡Bienvenid@ a Hotel x Horas! 🌟 \n\n  Encuentra tu nido de amor en solo unos minutos👩‍⚕️🚀 \n\n*ESTO ES UN BOT DE PRUEBA* 
          `,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: ID.FIND_PROVIDER,
                title: REPLIES_BUTTONS.INTRODUCTION_TEMPLATE_A1,
              },
            },
            {
              type: 'reply',
              reply: {
                id: ID.SUSCRIBE_PROVIDER,
                title: REPLIES_BUTTONS.INTRODUCTION_TEMPLATE_A2,
              },
            },
          ],
        },
      },
    };
  }

  static defaultMessageTemplate(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: '⛔ No es lo que esperaba, vuelve a intentar',
      },
    };
  }

  static defaultErrorSystemMessageTemplate(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: '⛔ Estamos teniendo problemas con el sistema vuelva a intentar en unos minutos o reinicie el proceso escribiendo "Reset"',
      },
    };
  }

  static resetQuestions(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: 'Has tenido varios inconvenientes, puedes reiniciar el proceso siempre que quieras escribiendo "Reset"',
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: ID.RESET,
                title: REPLIES_BUTTONS.RESET_TEMPLATE,
              },
            },
          ],
        },
      },
    };
  }
  
  static verifyingVoucherTemplate(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: 'Estamos verificando tu comprobante de pago, un minuto por favor! 🙌',
      },
    };
  }
  
  static notifyingProviderTemplate(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: `Ahora mismo estamos contactando con hoteles  \n Aguarda unos minutos, recibirás oferta de cuartos disponibles para continuar! ✅
        `,
      },
    };
  }

  static providersLinkMessage(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        "preview_url": true,
        body: 'Si eres hotel y quieres formar parte de hotel por horas , dar click al siguiente enlace y un asesor personalizado lo atenderá: https://wa.me/message/YK3OUKA76IHKN1',
      },
    };
  }

  static providerNotification(
    providerPhone: string,
    messageId: string,
    clientName: string,
    date: string,

  ) {
    return {
      messaging_product: 'whatsapp',
      to: providerPhone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `Cliente: ${clientName} \nTurno: ${date}`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: `accptcta-${messageId}`,
                title: REPLIES_BUTTONS.ACCEPT,
              },
            },
          ],
        },
      },
    };
  }

  static generateTextAccount(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: '☝️ Para terminar, por favor realizar el yape al 947308823 a nombre de Hotel por Horas SRL y enviar el boucher de pago en este chat. \n\n*ESTE ES UN BOT DE PRUEBA* \n\n*SUBIR CUALQUIER FOTO*',
      },
    };
  }

  static dniConfirmationTemplate(phone: string, dniName: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `¿Eres ${dniName}?`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: ID.ACCEPT_DNI,
                title: REPLIES_BUTTONS.CONFIRMATION_ANSWER,
              },
            },
            {
              type: 'reply',
              reply: {
                id: ID.RETRY_DNI,
                title: REPLIES_BUTTONS.TRY_AGAIN_ANSWER,
              },
            },
          ],
        },
      },
    };
  }


  static providerConfirmation(phone: string, providerName: string, fee: number, date: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `Por favor, confirma tu reserva: \n\n Hotel: ${providerName} \n Fecha y Hora: ${date} \nCosto: S/ ${fee}`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: ID.ACEPT_PROVIDER,
                title: REPLIES_BUTTONS.CONFIRMATION_ANSWER,
              },
            },
            {
              type: 'reply',
              reply: {
                id: ID.CHOOSE_ANOTHER,
                title: REPLIES_BUTTONS.CHOOSE_ANOTHER_ANSWER,
              },
            },
          ],
        },
      },
    };
  }

  static dateConfirmation(phone: string, date: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `¿Confirma la fecha y hora: ${date}? 👀`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id:ID.ACCEPT_DATE,
                title: REPLIES_BUTTONS.CONFIRMATION_ANSWER,
              },
            },
            {
              type: 'reply',
              reply: {
                id: ID.CHOOSE_ANOTHER,
                title: REPLIES_BUTTONS.CHOOSE_ANOTHER_DATE_ANSWER,
              },
            },
          ],
        },
      },
    };
  }

  static clientConfirmationPayment(appointment: any) {
    const {code, date, fee, clientId, providerId} = appointment;
    const {name: providerName, phone: providerPhone, address } = providerId;
    const {phone: clientPhone, name: clientName} = clientId;
    const dateString = dateToString(date);
    return {
      messaging_product: 'whatsapp',
      to: clientPhone,
      type: 'text',
      text: {
        body: `✅ ¡Gracias por reservar con el Hotel ${providerName}! 🧑‍⚕️ \n\nA continuación, los datos de tu cita. 🙌
        Húesped: ${clientName}
        Fecha y Hora de la reserva: ${dateString}
        Dirección: ${address}
        Costo de la reserva: S/${fee}
        Celular hotel: ${providerPhone}
        Codifo de rserva: ${code} 
        \n\n Recuerda que las horas se cuentan a partir de la hora reservada. \n\n ¡Te esperamos! 🙌`,
      },
    };
  }

  static providerConfirmationPayment(appointment: any) {
    const {code, date, fee, clientId, providerId} = appointment;
    const {phone: providerPhone} = providerId;
    const {phone: clientPhone, name: clientName} = clientId;
    const dateString = dateToString(date);
    return {
      messaging_product: 'whatsapp',
      to: providerPhone,
      type: 'text',
      text: {
        body: `¡Tienes una nueva reserva! ✅🙌 \n\n Huésped: ${clientName} \nFecha y Hora de la reserva: ${dateString} \nCelular Húesped: ${clientPhone} \n Código de reserva: ${code}`,
      },
    };
  }

  static rejectionPayment(phone: string, date: Date) {
    const dateString = dateToString(date);
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: `⛔️ Ups!, al parecer no es el comprobante que esperamos, por favor reenvía nuevamente el boucher de pago.`,
      },
    };
  }





  static generatePaymentOptions(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: 'Y ya para terminar, escoge tu medio de pago 🙌',
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: ID.PAYMENT_OPTIONS_YAPE,
                title: REPLIES_BUTTONS.PAYMENTS_OPTIONS[1],
              },
            },
          ],
        },
      },
    };
  }



  static generateInfoProvider(phone: string, providerId: string, date: string, fee: number, imageUrl: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'image',
          image: {
            link: imageUrl,
          },
        },
        body: {
          text: `Turno: ${date} \nCosto: S/ ${fee}`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: providerId,
                title: REPLIES_BUTTONS.SELECT_PROVIDER,
              },
            },
          ],
        },
      },
    };
  }
}

  // static generateSpecialitiesList(phone: string) {
  //   return {
  //     messaging_product: 'whatsapp',
  //     to: phone,
  //     type: 'interactive',
  //     interactive: {
  //       type: 'list',
  //       header: {
  //         type: 'text',
  //         text: 'Lista de especialidades 📋',
  //       },
  //       body: {
  //         text: 'Te ayudaremos a encontrar la especialidad que buscas',
  //       },
  //       footer: {
  //         text: 'DoctorQali te ayuda a encontrar la especialidad que buscas',
  //       },
  //       action: {
  //         button: 'Ver especialidades 🔎',
  //         sections: [
  //           {
  //             title: 'Especialidades',
  //             rows: SPECIALITIES_LIST
  //             // rows: [
  //             //   {
  //             //     id: '1',
  //             //     title: 'Nutrición',
  //             //     //   "description": "SECTION_1_ROW_1_DESCRIPTION"
  //             //   },
  //             //   {
  //             //     id: '2',
  //             //     title: 'Psicología',
  //             //     //   "description": "SECTION_1_ROW_2_DESCRIPTION"
  //             //   },
  //             //   {
  //             //     id: '3',
  //             //     title: 'Medicina General',
  //             //     // "description": "SECTION_1_ROW_2_DESCRIPTION"
  //             //   },
  //             //   {
  //             //     id: '4',
  //             //     title: 'Cardiología',
  //             //     // "description": "SECTION_1_ROW_2_DESCRIPTION"
  //             //   },
  //             //   {
  //             //     id: '5',
  //             //     title: 'Ginecología',
  //             //   },
  //             // ],
  //           },
  //         ],
  //       },
  //     },
  //   };
  // }

    // static generateTextChatGTP(text:string ,phone: string) {
  //   return {
  //     messaging_product: 'whatsapp',
  //     to: phone,
  //     type: 'text',
  //     text: {
  //       body: text,
  //     },
  //   };
  // }

  // static generateChatGPToptions(phone: string , text: string , speciality: string) {
  //   return {
  //     messaging_product: 'whatsapp',
  //     to: phone,
  //     type: 'interactive',
  //     interactive: {
  //       type: 'button',
  //       body: {
  //         text: text,
  //       },
  //       action: {
  //         buttons: [
  //           {
  //             type: 'reply',
  //             reply: {
  //               id: '1',
  //               title: speciality,
  //             },
  //           },
  //           {
  //             type: 'reply',
  //             reply: {
  //               id: '2',
  //               title: 'Otra especialidad',
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   };
  // }

    // static specialityConfirmation(phone: string, speciality: string) {
  //   return {
  //     messaging_product: 'whatsapp',
  //     to: phone,
  //     type: 'interactive',
  //     interactive: {
  //       type: 'button',
  //       body: {
  //         text: `¿Confirma su selección?: ${speciality} `,
  //       },
  //       action: {
  //         buttons: [
  //           {
  //             type: 'reply',
  //             reply: {
  //               id: 'accpt_speciality',
  //               title: REPLIES_BUTTONS.CONFIRMATION_ANSWER,
  //             },
  //           },
  //           {
  //             type: 'reply',
  //             reply: {
  //               id: 'retry_speciality',
  //               title: REPLIES_BUTTONS.CHOOSE_ANOTHER_ANSWER,
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   };
  // }