import * as moment from 'moment';

const format = 'DD-MM-YY hh:mm a';
const inputFormat = ['D M H', 'D M H:mm', 'D M HHmm', 'D M H A', 'D M H:mm A', 'D M HHmm A'];

export const stringToDate = (date: string) => {

  const result = moment(date, format);
  if(!result.isValid()) throw new Error();
  return result.toDate();
};

export const dateToString = (date: Date) => {
  const momentDate = moment(date);
  const dateString = momentDate.format(format);
  console.log('dateString', dateString);
  return dateString;
};



export const parseDateInput = (input) => {
    // Intentar interpretar la entrada con los diferentes formatos
    let fechaHora = moment(input, inputFormat, true);
    console.log('fechaHora', fechaHora);
    // Si la fecha y hora no son válidas, devolver "0"
    if (!fechaHora.isValid()) {
        return 'NO_DATE';
    }

    // Asumir AM/PM si no se especifica, basado en el horario de atención
    if (!/am|pm/i.test(input)) {
        const hora = fechaHora.hour();
        if (hora >= 6 && hora < 21) {
            fechaHora.add(12, 'hours');
        }
    }

    // Redondear minutos
    const minutos = fechaHora.minute();
    if (minutos < 15) {
        fechaHora.minute(0);
    } else if (minutos < 45) {
        fechaHora.minute(30);
    } else {
        fechaHora.add(1, 'hour').minute(0);
    }

    return fechaHora.format(format);
};