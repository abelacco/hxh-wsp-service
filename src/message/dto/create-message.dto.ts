import { IsDate, IsOptional, IsString } from "class-validator";

export class CreateMessageDto {
    @IsString()
    @IsOptional()
    clientName: string;

    @IsString()
    @IsOptional()
    doctor: string;

    @IsString()
    @IsOptional()
    speciality: string;

    @IsString()
    @IsOptional()
    phone: string;
    
    @IsDate()
    @IsOptional()
    date: Date;
    
    @IsString()
    @IsOptional()
    step: string;
    
    @IsString()
    @IsOptional()
    message: string;
    
    @IsString()
    @IsOptional()
    status: string;
    
    @IsString()
    @IsOptional()
    imageVoucher: string;
}
