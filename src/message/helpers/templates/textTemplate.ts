import { dateToString } from "../dateParser";

export class Templates {
  static dateStepTemplateMessage(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: {
        body: 'A continuación ingresa la fecha y hora de tu cita en el siguiente formato: 01-10-23 10:00 am',
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
              rows: [
                {
                  id: '1',
                  title: 'Nutrición',
                  //   "description": "SECTION_1_ROW_1_DESCRIPTION"
                },
                {
                  id: '2',
                  title: 'Psicología',
                  //   "description": "SECTION_1_ROW_2_DESCRIPTION"
                },
                {
                  id: '3',
                  title: 'Medicina General',
                  // "description": "SECTION_1_ROW_2_DESCRIPTION"
                },
                {
                  id: '4',
                  title: 'Cardiología',
                  // "description": "SECTION_1_ROW_2_DESCRIPTION"
                },
                {
                  id: '5',
                  title: 'Ginecología',
                },
              ],
            },
            // {
            //   "title": "SECTION_2_TITLE",
            //   "rows": [
            //     {
            //       "id": "SECTION_2_ROW_1_ID",
            //       "title": "SECTION_2_ROW_1_TITLE",
            //       "description": "SECTION_2_ROW_1_DESCRIPTION"
            //     },
            //     {
            //       "id": "SECTION_2_ROW_2_ID",
            //       "title": "SECTION_2_ROW_2_TITLE",
            //       "description": "SECTION_2_ROW_2_DESCRIPTION"
            //     }
            //   ]
            // }
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

  static generateThreeOptions(phone: string) {
    return {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: '¿Cúando te gustaría agendar tu cita?',
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'UNIQUE_BUTTON_ID_1',
                title: 'Hoy',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'UNIQUE_BUTTON_ID_2',
                title: 'Esta semana',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'UNIQUE_BUTTON_ID_3',
                title: 'La próxima semana',
              },
            },
          ],
        },
      },
    };
  }

  static generateInfoDoctor(phone: string, docNumber: string, date: string, fee: number) {
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
                id: docNumber,
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