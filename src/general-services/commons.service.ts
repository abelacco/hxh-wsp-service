import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CommonsService {

    apiService: string = process.env.API_SERVICE;

    constructor() {}

    async registerDni(infoMessage: any) {
    const dniRequest = await axios.get(
        `${this.apiService}/apiperu?idNumber=${infoMessage.content}`,
    );
    const dniResponse = dniRequest.data;
    if (dniResponse.success === true) {
        const dniName = `${dniResponse.nombres} ${dniResponse.apellidoPaterno} ${dniResponse.apellidoMaterno}`;        
        return dniName;

    } else {
        throw new BadRequestException();
    }
    }

    async uploadImage(imageUrl: any) {
        try {
            const uploadResponse = await axios.post(
                `${this.apiService}/cloudinary/uploadurl`,
                {
                    url: imageUrl,
                },
            );
            const response = uploadResponse.data.secure_url;
            return response;
        } catch (error) {
            console.log(error.response.data.message[0]);
            throw new Error(error.response.data.message);
            
        }
    }
}
