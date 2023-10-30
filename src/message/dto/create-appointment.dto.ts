export class CreateAppointmentDto {
  constructor(patientId: string, doctorId: string, fee: number, date: Date) {
    this.patientId = patientId;
    this.doctorId = doctorId;
    this.fee = fee;
    this.date = date;
  }
  doctorId: string;
  patientId: string;
  date: Date;
  fee: number;
  code?: number;
  voucher?: string;
}
