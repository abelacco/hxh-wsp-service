import * as moment from 'moment/moment';

export const dateValidator = (receivedDate: string) => {
  if(!receivedDate) return false;
  console.log("receivedDatae", receivedDate)
  const fecha1 = moment(receivedDate, 'DD-MM-YY HH:mm');
  console.log("validate1", fecha1)

  
  if(!fecha1.isValid()) return false;

  const fechaActual = moment();

  if(!(fechaActual.isBefore(fecha1))) return false;

  const diferenciaEnAños = fecha1.diff(fechaActual, 'years');
  
  if(diferenciaEnAños > 1) return false;

  return true;
};
