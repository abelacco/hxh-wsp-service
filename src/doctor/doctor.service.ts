import { Injectable } from '@nestjs/common';

@Injectable()
export class DoctorService {
  async findByPhone(doctorPhone: string) {
    const result = [];
    const res = await fetch(`${process.env.API_SERVICE}/doctor?phone=${doctorPhone}`);

    const getDoctors = await res.json();
      
    for (const doc of getDoctors) {
      result.push(doc)
    }
    
    return result;
  }

  async findById(doctorId: string) {
    const getDoctors = await fetch(`${process.env.API_SERVICE}/doctor/${doctorId}`);

    const result = await getDoctors.json();
    
    return result;
  }

  async getDoctors(speciality: string) {
    try {
      const res = await fetch(`${process.env.API_SERVICE}/doctor?speciality=${speciality}`);
      const getDoctors = await res.json();
      return getDoctors;
    } catch (error) {
      console.error('Error retreiving doctors:', error);
      throw error;
    }
    
  }
}
