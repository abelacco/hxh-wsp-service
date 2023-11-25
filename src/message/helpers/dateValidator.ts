import * as moment from 'moment/moment';

export const dateValidator = (receivedDate: string) => {
  console.log('receivedDate', receivedDate);
  if (!receivedDate) return false;

  // Parsear la fecha recibida y convertirla a UTC
  const fecha1 = moment.utc(receivedDate, 'DD-MM-YY HH:mm a');
  if (!fecha1.isValid()) {
    console.log("Fecha no válida");
    return false;
  }
  console.log("dateValidator 1 -> Si es fecha con formato valido");

  // Obtener la fecha y hora actuales en UTC
  const fechaActual = moment.utc();

  // Comprobar si la fecha y hora recibidas ya pasaron
  if (fechaActual.isSameOrAfter(fecha1)) {
    console.log("dateValidator 1 -> La fecha y hora ya pasaron");
    return false;
  }
  console.log("dateValidator 1 -> Fecha valida y futura");

  return true;
};
