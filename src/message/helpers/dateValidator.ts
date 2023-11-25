import * as moment from 'moment/moment';

export const dateValidator = (receivedDate: string) => {
  console.log('receivedDate', receivedDate);
  if (!receivedDate) return false;
  const fecha1 = moment(receivedDate, 'DD-MM-YY HH:mm');


  if (!fecha1.isValid()) return false;
  console.log("dateValidator 1 -> Si es fecha con formato valido")

  // Obtener la fecha y hora actuales
  const fechaActual = moment();

  // Comprobar si la fecha y hora recibidas ya pasaron
  if (fechaActual.isSameOrAfter(fecha1)) {
    console.log("dateValidator 1 -> La fecha y hora ya pasaron");
    return false;
  }

  const diferenciaEnAños = fecha1.diff(fechaActual, 'years');

  if (diferenciaEnAños > 1) return false;
  console.log("dateValidator 1 -> La fecha y hora son de este año")

  return true;
};
