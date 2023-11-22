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
        try {
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
        } catch (error) {
            console.error('MarketerService -> create ->', error.code);
            throw error;
        }
    }

    public async findByWaId(waId: String): Promise<Marketer> {
        try {
            const marketer = await this.marketerModel.findOne({
                wa_id: { $eq: waId }
            });
    
            return marketer;
        } catch (error) {
            console.error('MarketerService -> findByWaId ->', error.code);
            throw error;
        }
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
            console.error('MarketerService -> update ->', error.code);
            throw error;
        }
    }

    public async deleteOne({ waId }: { waId: string }) {
        try {
            const response = await this.marketerModel.deleteOne({
                wa_id: { $eq: waId }
            });

            return response;
        } catch (error) {
            console.error('MarketerService -> deleteOne ->', error.code);
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
            console.error('MarketerService -> completeRegister ->', error.code);
            throw error;
        }
    }

    public async sendMarketer({ waId }: { waId: string }) {
        try {
            const marketer = await this.findByWaId(waId);
            const affiliater = await this.existsAffiliater({ waId: marketer.wa_id });

            if (marketer && affiliater) {
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
                    .catch((error) => console.error('sendMarketer -> axios-post', error.code));
            
                return response;
            }

            return null;
        } catch (error) {
            console.error('MarketerService -> sendMarketer ->', error.code);
            throw error;
        }
    }

    public async findAffiliater({ affiliateId }: { affiliateId: string }) {
        try {
            const affiliater = await axios.get(`${process.env.API_SERVICE}/affiliate/${affiliateId}`)
                .then((response) => response.data)
                .catch((error) => console.error('MarketerService -> axios-get -> findAffiliater ->', error));

            return affiliater;
        } catch (error) {
            console.error('MarketerService -> findAffiliater ->', error.code);
            throw error;
        }
    }

    public async existsAffiliater({ waId }: { waId: String }) {
        try {
            const affiliater = await axios.get(`${process.env.API_SERVICE}/affiliate/filter?phone=${waId}`)
                .then((response) => response.data)
                .catch((error) => console.error('existsAffiliater -> axios-get:', error.code));

            return affiliater;
        } catch (error) {
            console.error('MarketerService -> existsAffiliater:', error.code);
            throw error;
        }
    }

    public async existsStore({ documentId }: { documentId: string }) {
        try {
            const store = await axios.get(`${process.env.API_SERVICE}/store/${documentId}`)
                .then((response) => response.data)
                .catch((error) => console.error('axios-get -> existsStore ->', error.code));

            return store;
        } catch (error) {
            console.error('MarketerService -> existsStore -> ', error.code);
            throw error;
        }
    }

    public async numberIsAffiliate({ phoneBusiness }: { phoneBusiness: string }) {
        try {
            const store = await axios.get(`${process.env.API_SERVICE}/store/filter?phone=${phoneBusiness}`)
                .then((response) => response.data)
                .catch((error) => console.error('MarketerService -> axios-get -> numberIsAffiliate ->', error.code));

            return store[0] || undefined;
        } catch (error) {
            console.error('MarketerService -> numberIsAffiliate ->', error.code);
            throw error;
        }
    }
}