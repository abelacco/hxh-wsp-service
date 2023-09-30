import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Message {

    @Prop({
        // index: true
    })
    clientName: string;

    @Prop({
        // index: true
    })
    doctor: string;

    @Prop({
        // index: true
    })
    speciality: string;

    @Prop({
        // required: true,
        unique: true,
        // index: true
    })
    phone: string;

   @Prop({
        // required: true,
        // index: true
    })
    date: Date;

    @Prop({
        // required: true,
        // index: true
    })
    step: string;
    
    @Prop({
        // required: true,
        // index: true
    })
    message: string;

    @Prop({
        // required: true,
        // index: true
    })
    status: string;

    @Prop({
        // required: true,
        // index: true
    })
    imageVoucher: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
