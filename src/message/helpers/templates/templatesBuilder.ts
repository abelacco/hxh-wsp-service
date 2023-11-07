import { dateToString } from '../dateParser';

function paramObj(content, type?) {
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

export const doctorTemplate = (appointment: any) => {
  const phone = appointment.phone;
  const doctorId = appointment.doctorId;
  const templateName = 'doctor_info';
  const date = dateToString(appointment.date)
  const params = templateParamsGenerator([
    paramObj(date),
    paramObj(appointment.fee),
  ]);

  const body = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'es_ES',
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

export const clientConfirmationTemplate = (appointment: any) => {
  //Obtener la informacion del modelo cita del api general
  const {code, date, fee, patientId, doctorId} = appointment;
  const {name: docName, speciality, phone: doctorPhone} = doctorId;
  const {phone: patientPhone, name: patientName} = patientId;

  const templateName = 'cliente_confirmacion_cita_servicio';
  
  const params = templateParamsGenerator([
    paramObj(docName),
    paramObj(patientName),
    paramObj(speciality),
    paramObj("presencial"),
    paramObj(date),
    paramObj("Hospital privado"),
    paramObj("-"),
    paramObj(fee),
    paramObj(doctorPhone),
    paramObj(code),
  ]);

  const body = {
    messaging_product: 'whatsapp',
    to: patientPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'es_ES',
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

export const doctorConfirmationTemplate = (appointment: any) => {
  const { date, fee, patientId, doctorId } = appointment;
  const { phone: doctorPhone } = doctorId;
  const { phone: patientPhone, name: patientName } = patientId;
  const templateName = 'doctor_confirmacion_cita';
  
  const params = templateParamsGenerator([
    paramObj(patientName),
    paramObj(patientPhone),
    paramObj("presencial"),
    paramObj(date),
    paramObj('-'),
    paramObj(fee),
  ]);

  const body = {
    messaging_product: 'whatsapp',
    to: doctorPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'es_ES',
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
