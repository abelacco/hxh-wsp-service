import * as moment from 'moment';

const format = 'DD-MM-YY hh:mm a';

export const stringToDate = (date: string) => {

  const result = moment(date, format);
  if(!result.isValid()) throw new Error();
  return result.toDate();
};

export const dateToString = (date: Date) => {
  const momentDate = moment(date);
  const dateString = momentDate.format(format);
  return dateString;
};
