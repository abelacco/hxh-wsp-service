import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CommonsService {

    apiService: string = process.env.API_SERVICE;

    constructor() {}

    async registerDni(dni: any) {
        try {
            const dniRequest = await axios.get(`${this.apiService}/apiperu?idNumber=${dni}`);
            const dniResponse = dniRequest.data;

            if (dniResponse.success === true) {
                const dniName = `${dniResponse.nombres} ${dniResponse.apellidoPaterno} ${dniResponse.apellidoMaterno}`;
                return dniName;
            } else {
                // Puedes lanzar una excepción con un mensaje más específico o manejar el error aquí
                throw new BadRequestException('DNI no encontrado o respuesta no exitosa');
            }
        } catch (error) {
            // Manejar errores de la petición, como problemas de red, errores del servidor, etc.
            console.error('Error al registrar DNI:', error.message);
            throw new BadRequestException('Error al procesar la solicitud de DNI');
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
