import { SPECIALITIES_LIST } from "../constants";
import { dateToString } from "../dateParser";

export class Templates {
  static dateStepTemplateMessage(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: 'A continuación ingresa la fecha y hora de tu cita en el siguiente formato: dd mm h.m am/pm.\nEjemplo: 6 11 3.40 pm',
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
          text: 'Hola!, soy un asistente virtual que te ayudará a conseguir una cita con el especialista que desees, ¿En que puedo ayudarte?',
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'see_specialities_button_id',
                title: 'Ver especialidades',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'specialist_button_id',
                title: 'Soy especialista',
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
        body: 'No es lo que esperaba, vuelve a intentar',
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
        body: 'Estamos verificando su comprobante de pago',
      },
    };
  }
  
  static notifyingDoctorsTemplate(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: 'Estamos contactando especialistas, aguarda mientras responden',
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
        body: 'Este es el link para registrar especialistas: https://wa.me/message/YK3OUKA76IHKN1',
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
          text: `${patientName} requiere de una consulta el día ${date}`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: `accptcta-${messageId}`,
                title: 'Aceptar',
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
        body: 'Puede realizar el yape al 947308823 a nombre de DoctorQali SRL, por favor enviar el voucher de pago.',
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
                title: 'Confirmar',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'retry_speciality',
                title: 'Seleccionar otra',
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
          text: `¿Confirma su cita con el doctor ${docName}, el dia y hora ${date} por un precio de S/ ${fee} soles?`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'accpt_doctor',
                title: 'Confirmar',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'retry_doctor',
                title: 'Elegir otro',
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
          text: `¿Confirma la fecha y hora: ${date}?`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'accpt_date',
                title: 'Confirmar',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'retry_date',
                title: 'Elegir otra',
              },
            },
          ],
        },
      },
    };
  }

  static confirmationPayment(phone: string, date: Date) {
    const dateString = dateToString(date);
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: `Su cita del día ${dateString} fue agendada exitosamente`,
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
        body: `Su cita del día ${dateString} no pudo ser agendada`,
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
          text: 'Lista de especialidades',
        },
        body: {
          text: 'Bienvenido a DoctorQali, te ayudaremos a encontrar el especialista que necesitas.',
        },
        footer: {
          text: 'DoctorQali te cuida',
        },
        action: {
          button: 'Ver especialidades',
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
          text: 'Escoger medio de pago',
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'UNIQUE_BUTTON_ID_1',
                title: 'Yape/Plin',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'UNIQUE_BUTTON_ID_2',
                title: 'Tarjeta',
              },
            },
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

  static generateInfoDoctor(phone: string, docId: string, date: string, fee: number) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'image',
          image: {
            link: 'https://res.cloudinary.com/dbq85fwfz/image/upload/v1696427010/doctorPresentacion2_b9o0vw.jpg',
          },
        },
        body: {
          text: `Turno disponible para el día ${date}, el costo de la consulta es de S/ ${fee} soles.`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: docId,
                title: 'Reservar cita',
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