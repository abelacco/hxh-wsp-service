export class Templates {

     static generateTextTemplate(message: string , phone: string) {
        return {
            messaging_product: "whatsapp",
            to: phone,
            type: "text",
            text: {
                body: message
            }
        }
    }

    static generateSpecialitiesList(message: string ,phone:string) {
        return {
            messaging_product: "whatsapp",
            to: phone,
            type: "interactive",
            interactive: {
                "type": "list",
                "header": {
                  "type": "text",
                  "text": "Lista de especialidades"
                },
                "body": {
                  "text": "Bienvenido a DoctorQali, te ayudaremos a encontrar el especialista que necesitas.",
                },
                "footer": {
                  "text": "DoctorQali te cuida"
                },
                "action": {
                  "button": "Ver especialidades",
                  "sections": [
                    {
                      "title": "Especialidades",
                      "rows": [
                        {
                          "id": "1",
                          "title": "Nutrición",
                        //   "description": "SECTION_1_ROW_1_DESCRIPTION"
                        },
                        {
                          "id": "2",
                          "title": "Psicología",
                        //   "description": "SECTION_1_ROW_2_DESCRIPTION"
                        },
                        {
                            "id": "3",
                            "title": "Medicina General",
                            // "description": "SECTION_1_ROW_2_DESCRIPTION"
                        },
                        {
                            "id": "4",
                            "title": "Cardiología",
                            // "description": "SECTION_1_ROW_2_DESCRIPTION"
 
                        },
                        {
                          "id": "5",
                          "title": "Ginecología",
                        },
                        
                      ]
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
                  ]
                }
            } 
        }
    }

    static generateTwoOptions(message: string ,phone:string) {
        return {
            messaging_product: "whatsapp",
            to: phone,
            type: "interactive",
            interactive: {
                type: "button",
                body: {
                  "text": "Escoger medio de pago",
                },
                action: {
                  buttons: [
                    {
                      type: "reply",
                      reply: {
                        id: "UNIQUE_BUTTON_ID_1",
                        title: "Yape/Plin"
                      }
                    },
                    {
                      type: "reply",
                      reply: {
                        id: "UNIQUE_BUTTON_ID_2",
                        title: "Tarjeta"
                      }
                    },
                    // {
                    //     "type": "reply",
                    //     "reply": {
                    //       "id": "UNIQUE_BUTTON_ID_3",
                    //       "title": "La próxima semana"
                    //     }
                    //   }
                  ]
                }
              }
           
            
        }
    }

    static generateThreeOptions(message: string ,phone:string) {
        return {
            messaging_product: "whatsapp",
            to: phone,
            type: "interactive",
            interactive: {
                type: "button",
                body: {
                  "text": "¿Cúando te gustaría agendar tu cita?",
                },
                action: {
                  buttons: [
                    {
                      type: "reply",
                      reply: {
                        id: "UNIQUE_BUTTON_ID_1",
                        title: "Hoy"
                      }
                    },
                    {
                      type: "reply",
                      reply: {
                        id: "UNIQUE_BUTTON_ID_2",
                        title: "Esta semana"
                      }
                    },
                    {
                        "type": "reply",
                        "reply": {
                          "id": "UNIQUE_BUTTON_ID_3",
                          "title": "La próxima semana"
                        }
                      }
                  ]
                }
              }
           
            
        }
    }

    static generateInfoDoctor(message: string ,phone:string) {
        return {
            messaging_product: "whatsapp",
            to: phone,
            type: "interactive",
            interactive: {
                type: "button",
                header: {
                        type: "image",
                        image: {
                            link: "https://scontent.fpiu3-1.fna.fbcdn.net/v/t1.6435-9/132003021_2674258026219396_2179362943986791906_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=a26aad&_nc_eui2=AeEh6oUQn2bf58BOrDFmmWL9ERX4MymkddsRFfgzKaR125lUMQSO-QQOIqrVGdLUyRM&_nc_ohc=DOAALdCDLNoAX8WlRxx&_nc_ht=scontent.fpiu3-1.fna&oh=00_AfB-uM4k78Me0SXWsCVm8TJgak0wAuLo0ck8ADKK2NrKoQ&oe=653FDDC5"
                        }
                },
                body: {
                  "text": "El turno dispoble es a las 10:00 am del día de hoy, el costo de la consuta es de S/ 50.00 soles.",
                },
                action: {
                  buttons: [
                    {
                      type: "reply",
                      reply: {
                        id: "UNIQUE_BUTTON_ID_1",
                        title: "Reservar cita"
                      }
                    },
                    // {
                    //   type: "reply",
                    //   reply: {
                    //     id: "UNIQUE_BUTTON_ID_2",
                    //     title: "Esta semana"
                    //   }
                    // }
                  ]
                }
              }
           
            
        }
    }

}