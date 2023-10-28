import { IsEnum, IsString } from "class-validator";

export enum PaymentStatus {
    ACCEPTED = "2",
    REJECTED = "3"
}

export class PaymentStatusDto {
    @IsString()
    messageId: string;

    @IsEnum(PaymentStatus)
    status: PaymentStatus;
}