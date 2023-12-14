import { Injectable } from '@nestjs/common';

@Injectable()
export class ProviderService {

  providerType: string = 'provider';
  
  async findByPhone(providerPhone: string) {
    const result = [];
    const res = await fetch(`${process.env.API_SERVICE}/${this.providerType}?phone=${providerPhone}`);

    const getProviders = await res.json();
      
    for (const pro of getProviders) {
      result.push(pro)
    }
    
    return result;
  }

  async findById(providerId: string) {
    const getProvider = await fetch(`${process.env.API_SERVICE}/${this.providerType}/${providerId}`);

    const result = await getProvider.json();
    
    return result;
  }

    async getAllProviders() {
    try {
      const res = await fetch(`${process.env.API_SERVICE}/${this.providerType}`);
      const getProviders = await res.json();
      return getProviders;
    } catch (error) {
      console.error('Error retreiving providers:', error);
      throw error;
    }

 // En los hoteles no habria por especialidad
  // async getProviders(speciality: string) {
  //   try {
  //     const res = await fetch(`${process.env.API_SERVICE}/${this.providerType}?speciality=${speciality}`);
  //     const getDoctors = await res.json();
  //     return getDoctors;
  //   } catch (error) {
  //     console.error('Error retreiving doctors:', error);
  //     throw error;
  //   }
    
  // }
    }
}
