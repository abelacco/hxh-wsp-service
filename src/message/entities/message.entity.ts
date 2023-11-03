import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { PAYMENTSTATUS, STEPS } from "src/config/constants";

@Schema()
export class Message extends Document {

    @Prop({
        // index: true
    })
    clientId: string;

    @Prop({
        // index: true
        unique: true,
    })
    appointmentId: string;
    
    @Prop({
        // index: true
    })
    clientName: string;

    @Prop({
        // index: true
    })
    doctorId: string;

    @Prop({
        // index: true
    })
    speciality: string;

    @Prop({
        // required: true,
        // index: true
    })
    phone: string;

    @Prop({
        // index: true
    })
    doctorPhone: string;

   @Prop({
        // required: true,
        // index: true
    })
    date: Date;

    @Prop({
        // required: true,
        // index: true
        type: String,
        enum: STEPS,
        default: STEPS.CHAT_GTP
    })
    step: string;

    @Prop({
        // required: true,
        // index: true
        type: String,
        enum: PAYMENTSTATUS,
    })
    status: string;

    @Prop({
        // required: true,
        // index: true
        unique: true,
    })
    imageVoucher: string;

    @Prop({
        // required: true,
        // index: true
    })
    fee: number;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
