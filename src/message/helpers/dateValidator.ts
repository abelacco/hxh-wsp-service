import * as moment from 'moment/moment';

export const dateValidator = (receivedDate: string) => {
  if(!receivedDate) return false;
  const period = receivedDate.split(' ').at(-1).toLowerCase();
  const periods = ['am', 'pm']
  const fecha1 = moment(receivedDate, 'DD-MM-YY hh:mm a');
  
  if(!fecha1.isValid()) return false;
  if(!period || !periods.some(p => p === period)) return false;

  const fechaActual = moment();

  if(!(fechaActual.isBefore(fecha1))) return false;

  const diferenciaEnAños = fecha1.diff(fechaActual, 'years');
  
  if(diferenciaEnAños > 1) return false;

  return true;
};
