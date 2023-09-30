import { IsDate, IsString } from "class-validator";

export class CreateMessageDto {
    @IsString()
    clientName: string;
    @IsString()
    doctor: string;
    @IsString()
    speciality: string;
    @IsString()
    phone: string;
    @IsDate()
    date: Date;
    @IsString()
    step: string;
    @IsString()
    message: string;
    @IsString()
    status: string;
    @IsString()
    imageVoucher: string;
}
