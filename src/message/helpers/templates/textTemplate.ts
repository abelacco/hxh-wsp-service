import { SPECIALITIES_LIST, WSP_REPLIES } from "../constants";
import { dateToString } from "../dateParser";

export class Templates {
  static dateStepTemplateMessage(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: `Listo 🙌 \n\nIngresa la fecha y hora que deseas tener tu CITA🕜 (DIA MES HORA MINUTOS AM/PM) \n\n Ejemplo: *21 11 430 pm* \nEjemplo 2: *21 11 400 pm* \n\nRecuerda ingresar el turno por cada 30 minutos ☝️
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
          // text: `¡Bienvenid@ a Doctor Qali! 🌟 \n\nTu camino hacia una atención médica instantánea y de calidad comienza aquí 👩‍⚕️🚀 \n\n¿Cómo podemos ayudarte hoy?
          // `,
          text: `¡Bienvenid@ a Doctor Qali! 🌟 \n\n Encuentra un médico en solo unos minutos👩‍⚕️🚀 \n\n*ESTO ES UN BOT DE PRUEBA* \n\n¿Cómo podemos ayudarte hoy?
          `,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'see_specialities_button_id',
                title: '📆 Agendar una cita',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'specialist_button_id',
                title: '⚕️ Soy doctor',
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
                id: 'button_reset_id',
                title: 'Reset',
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
  
  static notifyingDoctorsTemplate(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: `Ahora mismo estamos contactando especialistas 🧑‍⚕️ \n Aguarda unos minutos, recibirás los perfiles disponibles para continuar! ✅
        `,
      },
    };
  }

  static specialistsLinkMessage(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        "preview_url": true,
        body: 'Si eres médico y quieres formar parte de la red Qali , dar click al siguiente enlace y un asesor personalizado lo atenderá: https://wa.me/message/YK3OUKA76IHKN1',
      },
    };
  }

  static doctorNotification(
    doctorPhone: string,
    messageId: string,
    patientName: string,
    date: string,

  ) {
    return {
      messaging_product: 'whatsapp',
      to: doctorPhone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `Paciente: ${patientName} \nTurno: ${date}`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: `accptcta-${messageId}`,
                title: WSP_REPLIES.DOCTOR_ACCEPT,
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
        body: '☝️ Para terminar, por favor realizar el yape al 947308823 a nombre de Doctor Qali SRL y enviar el boucher de pago en este chat. \n\n*ESTE ES UN BOT DE PRUEBA* \n\n*SUBIR CUALQUIER FOTO*',
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
                id: 'accpt_dni',
                title: 'Confirmar ✅',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'retry_dni',
                title: 'Volver a intentar 👀',
              },
            },
          ],
        },
      },
    };
  }

  static specialityConfirmation(phone: string, speciality: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `¿Confirma su selección?: ${speciality} `,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'accpt_speciality',
                title: 'Confirmar ✅',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'retry_speciality',
                title: 'Elegir Otro 🔄',
              },
            },
          ],
        },
      },
    };
  }

  static doctorConfirmation(phone: string, docName: string, fee: number, date: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `Por favor, confirma tu cita: \n\nDoctor: ${docName} \nTurno: ${date} \nCosto: S/ ${fee}`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'accpt_doctor',
                title: 'Confirmar ✅',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'retry_doctor',
                title: 'Elegir Otro 🔄',
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
                id: 'accpt_date',
                title: 'Confirmar ✅',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'retry_date',
                title: 'Elegir otra 🤔',
              },
            },
          ],
        },
      },
    };
  }

  static patientConfirmationPayment(appointment: any) {
    const {code, date, fee, patientId, doctorId} = appointment;
    const {name: docName, speciality, phone: doctorPhone, office } = doctorId;
    const {phone: patientPhone, name: patientName} = patientId;
    const dateString = dateToString(date);
    return {
      messaging_product: 'whatsapp',
      to: patientPhone,
      type: 'text',
      text: {
        body: `✅ ¡Gracias por reservar con el Dr. ${docName}! 🧑‍⚕️ \n\nA continuación, los datos de tu cita. 🙌
        Paciente: ${patientName}
        Especialidad: ${speciality}
        Fecha y Hora de la cita: ${dateString}
        Cosultorio: ${office}
        Costo de la cita: S/${fee}
        Celular Doctor: ${doctorPhone}
        Identificación: ${code} \n\nMuchas gracias por contar con Doctor Qali, comparte este cupón SRTC7286, logra que usen Doctor Qali y gana 10 créditos💰 para canjearlos en tu próxima cita (1 crédito = 1 sol) 💯`,
      },
    };
  }

  static doctorConfirmationPayment(appointment: any) {
    const {code, date, fee, patientId, doctorId} = appointment;
    const {phone: doctorPhone} = doctorId;
    const {phone: patientPhone, name: patientName} = patientId;
    const dateString = dateToString(date);
    return {
      messaging_product: 'whatsapp',
      to: doctorPhone,
      type: 'text',
      text: {
        body: `¡Tienes una cita! ✅🧑‍⚕️🙌 \n\nPaciente: ${patientName} \nFecha y Hora de la cita: ${dateString} \nCelular Paciente: ${patientPhone} \nIdentificación: ${code}`,
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

  static generateSpecialitiesList(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: 'Lista de especialidades 📋',
        },
        body: {
          text: 'Te ayudaremos a encontrar la especialidad que buscas',
        },
        footer: {
          text: 'DoctorQali te ayuda a encontrar la especialidad que buscas',
        },
        action: {
          button: 'Ver especialidades 🔎',
          sections: [
            {
              title: 'Especialidades',
              rows: SPECIALITIES_LIST
              // rows: [
              //   {
              //     id: '1',
              //     title: 'Nutrición',
              //     //   "description": "SECTION_1_ROW_1_DESCRIPTION"
              //   },
              //   {
              //     id: '2',
              //     title: 'Psicología',
              //     //   "description": "SECTION_1_ROW_2_DESCRIPTION"
              //   },
              //   {
              //     id: '3',
              //     title: 'Medicina General',
              //     // "description": "SECTION_1_ROW_2_DESCRIPTION"
              //   },
              //   {
              //     id: '4',
              //     title: 'Cardiología',
              //     // "description": "SECTION_1_ROW_2_DESCRIPTION"
              //   },
              //   {
              //     id: '5',
              //     title: 'Ginecología',
              //   },
              // ],
            },
          ],
        },
      },
    };
  }

  static generateTextChatGTP(text:string ,phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: text,
      },
    };
  }

  static generateChatGPToptions(phone: string , text: string , speciality: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: text,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: '1',
                title: speciality,
              },
            },
            {
              type: 'reply',
              reply: {
                id: '2',
                title: 'Otra especialidad',
              },
            },
          ],
        },
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
                id: 'UNIQUE_BUTTON_ID_1',
                title: WSP_REPLIES.PAYMENTS_OPTIONS[1],
              },
            },
            // {
            //   type: 'reply',
            //   reply: {
            //     id: 'UNIQUE_BUTTON_ID_2',
            //     title: 'Tarjeta 💳',
            //   },
            // },
            // {
            //     "type": "reply",
            //     "reply": {
            //       "id": "UNIQUE_BUTTON_ID_3",
            //       "title": "La próxima semana"
            //     }
            //   }
          ],
        },
      },
    };
  }

  // static generateThreeOptions(phone: string) {
  //   return {
  //     messaging_product: 'whatsapp',
  //     to: phone,
  //     type: 'interactive',
  //     interactive: {
  //       type: 'button',
  //       body: {
  //         text: '¿Cúando te gustaría agendar tu cita?',
  //       },
  //       action: {
  //         buttons: [
  //           {
  //             type: 'reply',
  //             reply: {
  //               id: 'UNIQUE_BUTTON_ID_1',
  //               title: 'Hoy',
  //             },
  //           },
  //           {
  //             type: 'reply',
  //             reply: {
  //               id: 'UNIQUE_BUTTON_ID_2',
  //               title: 'Esta semana',
  //             },
  //           },
  //           {
  //             type: 'reply',
  //             reply: {
  //               id: 'UNIQUE_BUTTON_ID_3',
  //               title: 'La próxima semana',
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   };
  // }

  static generateInfoDoctor(phone: string, docId: string, date: string, fee: number, imageUrl: string) {
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
                id: docId,
                title: WSP_REPLIES.SELECT_DOCTOR,
              },
            },
            // {
            //   type: "reply",
            //   reply: {
            //     id: "UNIQUE_BUTTON_ID_2",
            //     title: "Esta semana"
            //   }
            // }
          ],
        },
      },
    };
  }
}