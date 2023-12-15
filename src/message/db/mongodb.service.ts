import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { Message } from '../entities/message.entity';
import { IMessageDao } from './messageDao';
// import { PaginationMessageDto } from '../dto/pagination.dto';
import { mongoExceptionHandler } from 'src/common/mongoExceptionHandler';
import { UpdateMessageDto } from '../dto';


@Injectable()
export class MongoDbService implements IMessageDao {
  constructor(
    @InjectModel(Message.name) private readonly _messageModel: Model<Message>,
  ) {}


  async updateMessage(id: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
    try{
      const updatedMessage = await this._messageModel.findByIdAndUpdate(
      id,
      updateMessageDto,
      { new: true },
    );
    return updatedMessage;
    }
    catch(error){
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  async updateStatusByAppId(appointmentId: string ,updateMessageDto: UpdateMessageDto ): Promise<Message> {
    try{
      const updatedMessage = await this._messageModel.findOneAndUpdate(
        { appointmentId }, // criterio de búsqueda
        { $set: { status: updateMessageDto.status , code: updateMessageDto.code} }, // actualización
        { new: true } // opciones para devolver el documento actualizado
    );
    return updatedMessage;
    }
    catch(error){
      if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
      else throw error;
    }
  }

  // async findMessageByterm(term: string): Promise<Message> {
  //   try{
  //     const message = await this._messageModel.findOne({term});
  //     return message;
  //   }
  //   catch(error){
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }
  // async findAllByPagination(paginationMessageDto: PaginationMessageDto): Promise<{data: Message[] ; total:number}> {
  //   try {
  //     // Construir el objeto de consulta
  //     const query = {};
  //     if (paginationMessageDto.phone) {
  //       query['phone'] = { $regex: paginationMessageDto.phone, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
  //     }
  //     if (paginationMessageDto.clientName) {
  //       query['clientName'] = { $regex: paginationMessageDto.clientName, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
  //     }
  
  //     // Aplicar paginación
  //     const limit = paginationMessageDto.limit || 10; // Valor por defecto si no se proporciona
  //     const offset = paginationMessageDto.offset || 0;
  
  //     // Realizar la consulta con filtros y paginación
  //     const data = await this._messageModel.find(query).sort({ _id: -1 }).limit(limit).skip(offset);  
  //     // Obtener el conteo total de documentos que coinciden con los criterios de búsqueda
  //     const total = await this._messageModel.countDocuments(query);
  
  //     return {data, total};
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }
  
    // async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
  //   try {
  //     const createDoctor = new this._doctorModel(createDoctorDto);
  //     await createDoctor.save();
  //     return createDoctor;
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }

  // async findAll(props?: paginationMessageDto): Promise<Array<Doctor>> {

  //   try {
  //     const QUERY = {};

  //     if(props.name) {
  //       QUERY["name"] = { $regex: props.name, $options: 'i' };
  //     }

  //     if(props.phone) {
  //       QUERY["phone"] = props.phone;
  //     }

  //     if(props.speciality) {
  //       QUERY["speciality"] = { $regex: props.speciality, $options: 'i' };
  //     }
  //     if(!isNaN(props.modality)) {
  //       QUERY["modality"] = props.modality;
  //     }


  //     const results = await this._doctorModel.find(QUERY);

  //     return results;
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }

  // async findByName(name: string): Promise<Doctor> {
  //   try {
  //     const findDoctor: Doctor = await this._messageModel.findOne({ name });
  //     if (!findDoctor) throw new NotFoundException('doctor not found!');
  //     return findDoctor;
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }

  // async findById(id: string): Promise<Doctor> {
  //   try {
  //     const doctor = await this._doctorModel.findById(id);
  //     return doctor;
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }

  // async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
  //   try {
  //     const doctor = await this._doctorModel.findByIdAndUpdate(
  //       id,
  //       updateDoctorDto,
  //     );
  //     return doctor;
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }

  // async remove(id: string): Promise<Doctor> {
  //   try {
  //     const doctor = await this._doctorModel.findByIdAndDelete(id);
  //     return doctor;
  //   } catch (error) {
  //     if (error instanceof mongo.MongoError) mongoExceptionHandler(error);
  //     else throw error;
  //   }
  // }
}
