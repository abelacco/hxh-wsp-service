import * as moment from 'moment/moment';
import 'moment-timezone';

export const dateValidator = (receivedDate: string) => {
  if (!receivedDate) return false;

  // Interpretar la fecha y hora en la zona horaria deseada y luego convertirla a UTC
  const zonaHoraria = 'America/Lima'; // Ejemplo de zona horaria (UTC-5)
  const fecha1 = moment.tz(receivedDate, 'DD-MM-YY HH:mm a', zonaHoraria).utc();

  if (!fecha1.isValid()) {
    console.log("Fecha no válida");
    return false;
  }

  const fechaActual = moment.utc();

  if (fechaActual.isSameOrAfter(fecha1)) {
    console.log("La fecha y hora ya pasaron");
    return false;
  }

  return true;
};
