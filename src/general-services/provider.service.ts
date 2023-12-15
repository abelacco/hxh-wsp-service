import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProviderService {

  providerType: string = 'provider';

  async findByPhone(providerPhone: string) {
    try {
        const response = await axios.get(`${process.env.API_SERVICE}/${this.providerType}?phone=${providerPhone}`);
        return response.data; // axios automáticamente maneja la conversión a JSON
    } catch (error) {
        console.error('Error retrieving providers by phone:', error);
        throw error;
    }
}


async findById(providerId: string) {
  try {
      const response = await axios.get(`${process.env.API_SERVICE}/${this.providerType}/${providerId}`);
      return response.data; // La respuesta ya está en formato JSON
  } catch (error) {
      console.error('Error retrieving provider by ID:', error);
      throw error;
  }
}


async getAllProviders() {
  try {
      const response = await axios.get(`${process.env.API_SERVICE}/${this.providerType}`);
      return response.data; // La respuesta ya está en formato JSON
  } catch (error) {
      console.error('Error retrieving all providers:', error);
      throw error;
  }
}

}
