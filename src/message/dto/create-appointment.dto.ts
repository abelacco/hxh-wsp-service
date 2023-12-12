export class CreateAppointmentDto {

  providerId: string;
  clientId: string;
  date: Date;
  fee: number;
  code?: number;
  voucher: string;

  constructor(clientId: string, providerId: string, fee: number, date: Date, voucherLink: string) {
    this.clientId = clientId;
    this.providerId = providerId;
    this.fee = fee;
    this.date = date;
    this.voucher = voucherLink;
  }

}
