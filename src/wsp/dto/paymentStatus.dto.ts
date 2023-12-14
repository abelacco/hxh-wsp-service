import { IsEnum, IsString } from "class-validator";
import { PAYMENTSTATUS } from "src/message/helpers/constants";

export class PaymentStatusDto {
    @IsString()
    id: string;

    @IsEnum(PAYMENTSTATUS)
    status: number;
}