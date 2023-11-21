import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Marketer } from './entities/marketer.schema';
import { Model } from 'mongoose';
import { Status } from './enums/status.enum';
import axios from 'axios';

@Injectable()
export class MarketerService {
    constructor(@InjectModel(Marketer.name) private readonly marketerModel: Model<Marketer>) {}

    public async create({ waId }: { waId: String }): Promise<Marketer> {
        const createdMarketer = new this.marketerModel({
            wa_id: waId,
            status: Status.INCOMPLETE,
            documentId: '',
            fullname: '',
            phoneBusiness: '',
            imageUrl: '',
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

    public async sendMarketer({ waId }: { waId: string }) {
        try {
            const marketer = await this.findByWaId(waId);
            const affiliater = await axios.get(`${process.env.API_SERVICE}/affiliate/filter?phone=${marketer.wa_id}`)
                .then((response) => response.data)
                .catch((error) => console.error(error));

            if (marketer) {
                const marketerBody = {
                    documentId: marketer.documentId,
                    fullname: marketer.fullname,
                    phone: marketer.phoneBusiness,
                    imageUrl: marketer.imageUrl,
                    codeQr: marketer.qrCode,
                    lat: marketer.ubication.latitude,
                    long: marketer.ubication.longitude,
                    affiliateId: affiliater._id
                };
    
                const response = await axios.post(`${process.env.API_SERVICE}/store`, marketerBody)
                    .then((response) => response.data)
                    .catch((error) => console.error(error));
            
                return response;
            }

            return null;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public async findAffiliater({ affiliateId }: { affiliateId: string }) {
        try {
            const affiliater = await axios.get(`${process.env.API_SERVICE}/affiliate/${affiliateId}`)
                .then((response) => response.data)
                .catch((error) => console.error(error));

            return affiliater;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}