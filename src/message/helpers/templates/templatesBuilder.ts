import { Message } from 'src/message/entities/message.entity';

function obj(content, type?) {
  let obj = { content: content, type: '' };
  if (type) obj.type = type;
  return obj;
}

const templateParamsGenerator = (params) => {
  return params.map((p) => {
    let param = { type: p.type ? p.type : 'text' };
    param[param.type] = p.content;
    return param;
  });
};

export const doctorTemplate = (message: Message) => {
  const phone = message.phone;
  const doctorId = message.doctorId;
  const templateName = 'doctor_info';
  
  const params = templateParamsGenerator([
    obj(message.clientName),
    obj(message.date),
    obj(message.fee),
    obj(message.appointmentId),
    obj(message.phone),
  ]);

  const body = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'es_MX',
      },
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: {
                link: 'https://www.wellingtonregional.com/sites/wellingtonregional.com/files/doctors_visit_1200x900.jpg',
              },
            },
          ],
        },
        {
          type: 'body',
          parameters: params,
        },
        {
          type: 'button',
          sub_type: 'quick_reply',
          "index": "0",
          "parameters": [
            {
              type: 'payload',
              payload: doctorId
            }
          ]
        }
      ],
    },
  };

  return body;
};

export const confirmationTemplate = (message: Message) => {
  const phone = message.phone;
  const templateName = 'doctor_info';
  
  const params = templateParamsGenerator([
    obj(message.clientName),
    obj(message.date),
    obj(message.fee),
    obj(message.appointmentId),
    obj(message.phone),
  ]);

  const body = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'es_MX',
      },
      components: [
        {
          type: 'body',
          parameters: params,
        },
      ],
    },
  };

  return body;
};
