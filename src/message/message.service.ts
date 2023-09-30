import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MessageService {

  constructor(
    @InjectModel(Message.name) 
    private readonly messageModel: Model<Message>) 
  {}
  
  async create(createMessageDto: CreateMessageDto) {
    try{
      const message = await this.messageModel.create(createMessageDto);
      return message;
    }
    catch(error){
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }

  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException('Doctor ya existe' + JSON.stringify(error.keyValue));
    }
    throw new InternalServerErrorException('Error creando doctor' + JSON.stringify(error));
  }
}
