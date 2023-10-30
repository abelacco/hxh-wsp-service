import {
  Injectable,
} from '@nestjs/common';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { STEPS } from '../config/constants';
import { messageDestructurer } from './helpers/messageDestructurer';
import { IParsedMessage } from './entities/parsedMessage';
import { UpdateMessageDto } from './dto/update-message.dto';
import { BotResponseService } from './bot-response/bot-response.service';
import { WspReceivedMessageDto } from './dto/wspReceivedMessage.dto';
import {
  DoctorMessageValidator,
  receivedMessageValidator,
} from './helpers/receivedMessageValidator';
import { DoctorService } from 'src/doctor/doctor.service';
import { stringToDate } from './helpers/dateParser';
import { createAppointment } from './helpers/createAppointment';
import axios from 'axios';
import { mongoErrorHandler } from 'src/common/hepers/mongoErrorHandler';
import { messageErrorHandler } from './helpers/messageErrorHandler';
@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly messageBuilder: BotResponseService,
    private readonly doctorService: DoctorService,
  ) {}

  async proccessMessage(messageFromWSP: WspReceivedMessageDto) {
    /*
      Get required info of the received message
    */
    const infoMessage = messageDestructurer(messageFromWSP);
    console.log('mensaje parseado: ', infoMessage);

    /*
      Verify if it's a doctor response or
      a patient message
    */
    if (!DoctorMessageValidator(infoMessage)) {
      const findMessage = await this.findOrCreateMessage(infoMessage);
      return await this.patientMessageHandler(infoMessage, findMessage);
    } else {
      const getMessageResponded = await this.findById(
        infoMessage.content.id.split('-')[1],
      );

      return this.doctorMessageHandler(infoMessage, getMessageResponded);
    }
  }

  async patientMessageHandler(
    infoMessage: IParsedMessage,
    findMessage: Message,
  ) {
    const buildedMessages = [];
    /*
      Reset the information of the patient message
    */
    if (
      infoMessage.type === 'text' &&
      infoMessage.content.toUpperCase() === 'RESET'
    ) {
      findMessage.step = STEPS.SELECT_SPECIALTY;
      findMessage.speciality = '';
      findMessage.doctor = '';
      findMessage.date = null;
      buildedMessages.push(
        await this.updateAndBuildPatientMessage(findMessage),
      );
      return buildedMessages;
    }

    const validateStep = receivedMessageValidator(
      findMessage.step,
      infoMessage,
    );
    console.log('validacion: ', validateStep);
    if (!validateStep) {
      const errorMessage = messageErrorHandler(findMessage);
      buildedMessages.push(errorMessage);
      return buildedMessages;
    }
    switch (findMessage.step) {
      /*
        Handle what message template would be returned
        according to the step
      */
      case STEPS.INIT:
        findMessage.step = STEPS.SELECT_SPECIALTY;
        buildedMessages.push(
          await this.updateAndBuildPatientMessage(findMessage),
        );
        break;
      case STEPS.SELECT_SPECIALTY:
        findMessage.step = STEPS.INSERT_DATE;
        findMessage.speciality = infoMessage.content.title;
        buildedMessages.push(
          await this.updateAndBuildPatientMessage(findMessage),
        );
        break;
      case STEPS.INSERT_DATE:
        findMessage.step = STEPS.SELECT_DOCTOR;
        findMessage.date = stringToDate(infoMessage.content);
        const patientMessage =
          this.messageBuilder.searchingDoctorTemplateBuilder(
            infoMessage.clientPhone,
          );
        buildedMessages.push(patientMessage);
        await this.updateMessage(findMessage.id, findMessage);
        this.messageBuilder.buildDoctorNotification(findMessage);
        break;
      case STEPS.SELECT_DOCTOR:
        findMessage.step = STEPS.SELECT_PAYMENT;
        findMessage.doctor = infoMessage.content.id;
        const doctor = await this.doctorService.findByPhone(
          infoMessage.content.id,
        );
        findMessage.fee = doctor[0].fee;
        await createAppointment(findMessage);
        buildedMessages.push(
          await this.updateAndBuildPatientMessage(findMessage),
        );
        break;
      case STEPS.SELECT_PAYMENT:
        findMessage.step = STEPS.SUBMIT_VOUCHER;
        buildedMessages.push(
          await this.updateAndBuildPatientMessage(findMessage),
        );
        break;
      case STEPS.SUBMIT_VOUCHER:
        findMessage.step = STEPS.SEND_CONFIRMATION;
        const waitingMessage = await this.updateAndBuildPatientMessage(findMessage);
        buildedMessages.push(waitingMessage);
        await this.sendVoucherImage(infoMessage.content, findMessage);
        break;
      default:
        return false;
    }
    return buildedMessages;
  }

  async sendVoucherImage(image: string, message: Message) {
    const getImage = await fetch(`https://graph.facebook.com/v16.0/${image}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
      },
    });
    const imageUrl = await getImage.json();
    try {
      const imageData = await axios
      .get(imageUrl.url, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
        },
      })
      const imageBuffer = Buffer.from(imageData.data, 'binary');
      const mimeType = imageData.headers["content-type"];
      const base64Image = imageBuffer.toString('base64');

      const uploadResponse = await axios.post(`${process.env.API_SERVICE}/cloudinary/uploadbuffer`, {
        imageBuffer: `data:${mimeType};base64,${base64Image}`
      });
      message.imageVoucher = uploadResponse.data.imageUrl.secure_url;
      await this.updateMessage(message.id, message);
    } catch (error) {
        console.error('Error al obtener la imagen:', error);
    }
  }

  async doctorMessageHandler(infoMessage: IParsedMessage, message: Message) {
    if (message.step === STEPS.SELECT_DOCTOR) {
      message.doctor = infoMessage.clientPhone;
      const doctor = await this.doctorService.findByPhone(
        infoMessage.clientPhone,
      );
      message.fee = doctor[0].fee;
      return [this.messageBuilder.buildMessage(message)];
    }
    return false;
  }

  createStatusNotification(message: Message) {
    const messages = [];
    const date = message.date;
    if(message.status === "2") {
      messages.push(
        this.messageBuilder.buildConfirmationNotification(date, message.phone),
        this.messageBuilder.buildConfirmationNotification(date, message.doctor),
      );
      return messages;
    }

    messages.push(
      this.messageBuilder.buildRejectionNotification(date, message.phone),
      this.messageBuilder.buildRejectionNotification(date, message.doctor)
    );
    return messages;
  }

  async updateAndBuildPatientMessage(message: Message) {
    await this.updateMessage(message.id, message);
    return this.messageBuilder.buildMessage(message);
  }

  async findById(id: string): Promise<Message> {
    const message = await this.messageModel.findById(id);
    return message;
  }

  async findOrCreateMessage(receivedMessage: IParsedMessage): Promise<Message> {
    /*
      Find or create a new message
      Receive a parsed message
    */
    const message = await this.messageModel.findOne({
      phone: receivedMessage.clientPhone,
    });
    if (!message) {
      const createMessage = new this.messageModel({
        phone: receivedMessage.clientPhone,
        clientName: receivedMessage.clientName,
        doctor: '',
      });
      await createMessage.save();
      return createMessage;
    }

    return message;
  }

  async create(createMessageDto: any) {
    try {
      const message = await this.messageModel.create(createMessageDto);
      return message;
    } catch (error) {
      mongoErrorHandler(error);
    }
  }

  findAll() {
    return `This action returns all message`;
  }

  async findOne(phone: string) {
    const message = await this.messageModel.findOne({ phone: phone });
    return message;
  }

  async updateMessage(id: string, updateMessageDto: UpdateMessageDto) {
    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      id,
      updateMessageDto,
      { new: true },
    );
    return updatedMessage;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
