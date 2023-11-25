import * as moment from 'moment/moment';

export const dateValidator = (receivedDate: string) => {
  console.log('receivedDate', receivedDate);
  if (!receivedDate) return false;

  // Interpretar la fecha y hora en la zona horaria local y luego convertirla a UTC
  const fecha1 = moment(receivedDate, 'DD-MM-YY HH:mm a').utc();

  console.log("fecha1 (UTC)", fecha1.format());
  if (!fecha1.isValid()) {
    console.log("Fecha no válida");
    return false;
  }

  const fechaActual = moment.utc();
  console.log("fechaActual (UTC)", fechaActual.format());

  if (fechaActual.isSameOrAfter(fecha1)) {
    console.log("La fecha y hora ya pasaron");
    return false;
  }

  return true;
};
