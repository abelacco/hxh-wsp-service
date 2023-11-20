import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Marketer } from './entities/marketer.schema';
import { Model } from 'mongoose';
import { Status } from './enums/status.enum';

@Injectable()
export class MarketerService {
    constructor(@InjectModel(Marketer.name) private readonly marketerModel: Model<Marketer>) {}

    public async create({ waId, clientName}: { waId: String, clientName: String }): Promise<Marketer> {
        const createdMarketer = new this.marketerModel({
            wa_id: waId,
            clientName,
            status: Status.INCOMPLETE,
            DNI: '',
            RUC: '',
            name: '',
            image: '',
            ubication: '',
            qrCode: ''
        });
        
        return await createdMarketer.save();
    }

    public async findByWaId(waId: String): Promise<Marketer> {
        const marketer = await this.marketerModel.findOne({
            wa_id: { $eq: waId }
        });

        return marketer;
    }

    public async update({ waId, field, value }: { waId: string, field: string, value: any }) {
        try {
            const updateFields: Record<string, any> = {};
            updateFields[field] = value;

            const markter = await this.marketerModel.updateOne(
                { wa_id: { $eq: waId }},
                {
                    $set: updateFields
                }
            );

            return markter;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public async completeRegister({ waId, updateFields }: { waId: string, updateFields: Record<string, any>}) {
        try {
            const marketer = await this.marketerModel.updateOne(
                { wa_id: { $eq: waId } },
                { $set: updateFields }
            );

            return marketer;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}