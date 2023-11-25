import * as moment from 'moment/moment';

export const dateValidator = (receivedDate: string) => {
  console.log('receivedDate', receivedDate);
  if(!receivedDate) return false;
  const fecha1 = moment(receivedDate, 'DD-MM-YY HH:mm');

  
  if(!fecha1.isValid()) return false;
console.log("paso validacion 1")
  const fechaActual = moment();

  if(!(fechaActual.isBefore(fecha1))) return false;
  console.log("paso validacion 2")

  const diferenciaEnAños = fecha1.diff(fechaActual, 'years');
  
  if(diferenciaEnAños > 1) return false;
  console.log("paso validacion 3")

  return true;
};
