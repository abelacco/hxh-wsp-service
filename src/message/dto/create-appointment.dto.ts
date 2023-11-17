export class CreateAppointmentDto {
  constructor(patientId: string, doctorId: string, fee: number, date: Date, voucherLink: string) {
    this.patientId = patientId;
    this.doctorId = doctorId;
    this.fee = fee;
    this.date = date;
    this.voucher = voucherLink;
  }
  doctorId: string;
  patientId: string;
  date: Date;
  fee: number;
  code?: number;
  voucher: string;
}
