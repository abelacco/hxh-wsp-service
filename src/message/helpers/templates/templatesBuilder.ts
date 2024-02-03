import { dateToString } from '../dateParser';

export const paramObj = (content, type?) => {
  let obj = { content: content, type: '' };
  if (type) obj.type = type;
  return obj;
}

export const templateParamsGenerator = (params) => {
  return params.map((p) => {
    let param = { type: p.type ? p.type : 'text' };
    param[param.type] = p.content;
    return param;
  });
};

//   const phone = appointment.phone;
//   const doctorId = appointment.doctorId;
//   const templateName = 'doctor_info';
//   const date = dateToString(appointment.date)
//   const params = templateParamsGenerator([
//     paramObj(date),
//     paramObj(appointment.fee),
//   ]);

//   const body = {
//     messaging_product: 'whatsapp',
//     to: phone,
//     type: 'template',
//     template: {
//       name: templateName,
//       language: {
//         code: 'es_ES',
//       },
//       components: [
//         {
//           type: 'header',
//           parameters: [
//             {
//               type: 'image',
//               image: {
//                 link: 'https://www.wellingtonregional.com/sites/wellingtonregional.com/files/doctors_visit_1200x900.jpg',
//               },
//             },
//           ],
//         },
//         {
//           type: 'body',
//           parameters: params,
//         },
//         {
//           type: 'button',
//           sub_type: 'quick_reply',
//           "index": "0",
//           "parameters": [
//             {
//               type: 'payload',
//               payload: doctorId
//             }
//           ]
//         }
//       ],
//     },
//   };

//   return body;
// };

export const clientConfirmationTemplate = (appointment: any) => {
  //Obtener la informacion del modelo cita del api general
  const {code, date, fee, patientId, doctorId} = appointment;
  const {name: docName, speciality, phone: doctorPhone} = doctorId;
  const {phone: patientPhone, name: patientName} = patientId;

  const templateName = 'cliente_confirmacion_cita_servicio';
  const stringDate = dateToString(date);
  
  const params = templateParamsGenerator([
    paramObj(docName),
    paramObj(patientName),
    paramObj(speciality),
    paramObj("presencial"),
    paramObj(stringDate),
    paramObj("Hospital privado"),
    paramObj(fee),
    paramObj('code'),
    paramObj("-"),
    paramObj(doctorPhone),
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
  const templateName = 'doctor_confirmarcion_cita';
  const stringDate = dateToString(date);

  const params = templateParamsGenerator([
    paramObj(patientName),
    paramObj("presencial"),
    paramObj(stringDate),
    paramObj(fee),
    paramObj('code'),
    paramObj('-'),
    paramObj(patientPhone),
  ]);

  const body = {
    messaging_product: 'whatsapp',
    to: doctorPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'es',
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


