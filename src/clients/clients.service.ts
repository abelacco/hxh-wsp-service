import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ClientsService {

  clientType: string = 'client';

  async findOrCreateClient(clientPhone: string, name: string) {
    const encodedName = encodeURIComponent(name);
    //Busca cliente por número de teléfono
    try {
      const getClient = await axios.get(
        `${process.env.API_SERVICE}/${this.clientType}/findorcreate?phone=${clientPhone}&name=${encodedName}`,
      );
      const client = getClient.data;
      return client;
    }
    catch (error) {
      console.log(error.response.data.message[0]);
      throw new Error(error.response.data.message);
    }
  
  }

  async updateClient(clientId: string, infoClient: any) {
    try {
      const updateClient = await axios.patch(
        `${process.env.API_SERVICE}/${this.clientType}/${clientId}`, { dni: infoClient.dni, name: infoClient.name });
      const clientUpdated = updateClient.data;
      return clientUpdated;
    } catch (error) {
      console.log(error.response.data.message[0]);
      throw new Error(error.response.data.message);
    }
  }
  
 
    
}
