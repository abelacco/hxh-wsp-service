import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';
import { Ubication } from "../entities/marketer.schema";
import { Status } from "../enums/status.enum";

export class MarketerDto {
    @IsString()
    @IsOptional()
    wa_id: String;

    @IsNotEmpty()
    @IsEnum(Status)
    status: Status;

    @IsString()
    @IsOptional()
    DNI: String;

    @IsString()
    @IsOptional()
    RUC: String;

    @IsString()
    @IsOptional()
    name: String;

    @IsString()
    @IsOptional()
    image: String;

    @IsOptional()
    @Type(() => Ubication)
    @ValidateNested({ each: true })
    ubication: Ubication;

    @IsOptional()
    @IsString()
    qrCode: String;
}