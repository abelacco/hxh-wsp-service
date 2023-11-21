import { Injectable } from '@nestjs/common';
import { MetaProvider } from '../../provider/meta.provider';
import { MarketerService } from '../marketer.service';
import { validateDNI, validateRUC } from '../utils/validation';
import { WSP_MESSAGE_TYPES } from 'src/provider/constants/wsp-constants';
import { Status } from '../enums/status.enum';
import axios from 'axios';

@Injectable()
export class MarketerEvents {

    constructor(
        private metaProvider: MetaProvider,
        private readonly marketerService: MarketerService
    ) {}

    public async sendWelcome(data: any) {
        console.log('event MARKETER_START');
        const { message } = data;
        // TODO: Modificar el formato del mensaje parseado para que 'phone' no venga anidado
        //? NOTA: La linea que modifica la lada del numero es solo para poder hacer pruebas en produccion desde México
        const { phone } = message.from.phone;
        const clientName = message.from.name
        const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

        await this.metaProvider.sendSimpleButtons({
            message: `Hola ${clientName}, Bienvenido(a) al sistema de registro de mercadistas. ¿Deseas registrar un nuevo afiliado?`,
            clientPhone,
            listOfButtons: [
                {
                    title: '✅ CONTINUAR',
                    id: 'step-1-continuar'
                },
                {
                    title: '❌ CANCELAR',
                    id: 'step-1-cancelar'
                }
            ]
        });
    }

    public async sendError(data: any) {
        const { phone } = data.message.from.phone;
        const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

        await this.metaProvider.sendText({
            clientPhone,
            message: '⚠️ Eso no es lo que esperaba, por favor, intentalo de nuevo'
        });
    }

    public async cancelRegister(data: any) {
        const { phone } = data.message.from.phone;
        const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

        await this.metaProvider.sendText({
            clientPhone,
            message: '❌ Ok. Proceso cancelado!'
        });
    }

    public async requestRUCDNI(data: any) {
        console.log('event MARKETER_REQUEST_RUC_DNI');
        try {
            const { contacts } = data;
            const { wa_id, profile } = contacts;
            const { phone } = data.message.from.phone;
            const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

            const marketer = await this.marketerService.findByWaId(wa_id);

            if (!marketer) {
                await this.marketerService.create({
                    waId: wa_id
                })
                .then(async () => {
                    await this.metaProvider.sendText({
                        clientPhone,
                        message: 'Ok. Para empezar, enviame el DNI o el RUC de tu negocio por favor.'
                    });
                })
                .catch(async (error) => {
                    await this.metaProvider.sendText({
                        clientPhone,
                        message: '⛔ Ocurrio un error al iniciar el proceso de registro, por favor, intentalo de nuevo.'
                    });

                    console.error(error);
                });
            }
        } catch (error) {
            await this.sendError(data);
            await this.sendWelcome(data);
        }
    }

    public async validateRUCDNI(data: any) {
        try {
            const { message, contacts } = data;
            const { wa_id } = contacts;
            const { phone } = data.message.from.phone;
            const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;
            const rucOrDni = message.text.body;

            await this.metaProvider.sendText({
                clientPhone,
                message: '⌛ Validando el RUC/DNI, espera un momento...'
            });

            if (validateDNI(rucOrDni) || validateRUC(rucOrDni)) {
                await axios.get(`${process.env.API_SERVICE}/apiperu?idNumber=${rucOrDni}`)
                    .then(async (response) => {
                        if (response.data.message !== 'No se encontraron resultados.') {
                            await this.metaProvider.sendText({
                                clientPhone,
                                message: '✅ El RUC/DNI es valido!'
                            });

                            await this.marketerService.update({
                                waId: wa_id,
                                field: 'idNumber',
                                value: rucOrDni
                            })
                            .then(async (response) => {
                                if (response.modifiedCount === 1) {
                                    await this.metaProvider.sendText({
                                        clientPhone,
                                        message: 'Ahora, por favor, ¿Puedes decirme cual es el nombre de tu negocio?'
                                    });
                                }
                            })
                            .catch(async (error) => {
                                await this.metaProvider.sendText({
                                    clientPhone,
                                    message: '⛔ Ocurrio un error al guardar el RUC/DNI, por favor, intentalo de nuevo :('
                                });
                            });
                        } else {
                            await this.metaProvider.sendText({
                                clientPhone,
                                message: '⚠️ No se encontro ningun registro asociado al RUC/DNI proporcionado, por favor, intentalo de nuevo.'
                            });
                        }
                    })
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⚠️ El RUC/DNI no es valido, por favor, intentalo de nuevo.'
                });
            }
        } catch (error) {
            await this.sendError(data);
        }
    }

    public async validateName(data: any) {
        try {
            const { message, contacts } = data;
            const { wa_id } = contacts;
            const { phone } = data.message.from.phone;
            const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;
            const businessName = message.text.body;

            if (businessName) {
                await this.marketerService.update({
                    waId: wa_id,
                    field: 'name',
                    value: businessName
                })
                .then(async (response) => {
                    if (response.modifiedCount === 1) {
                        await this.metaProvider.sendText({
                            clientPhone,
                            message: 'Excelente. Ahora necesito que me compartas la ubicacion GPS de tu negocio.'
                        });
                    }
                })
                .catch(async (error) => {
                    await this.metaProvider.sendText({
                        clientPhone,
                        message: '⛔ Ocurrio un error al intentar actualizar el nombre del negocio, por favor, intentalo de nuevo :('
                    });

                    console.error(error);
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⚠️ El nombre proporcionado no es valido, por favor, intentalo de nuevo.'
                });
            }
        } catch (error) {
            await this.sendError(data);
        }
    }

    public async validateUbication(data: any) {
        try {
            const { contacts, message } = data;
            const { wa_id } = contacts;
            const { location } = message;
            const { address, latitude, longitude, name, url } = location;
            const { phone } = data.message.from.phone;
            const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

            const ubication = {
                address,
                latitude,
                longitude,
                name,
                url
            }

            await this.metaProvider.sendText({
                clientPhone,
                message: '⌛ Validando ubicacion, espera un momento...'
            });

            if (message.type === WSP_MESSAGE_TYPES.LOCATION) {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '✅ Ubicacion valida!.'
                });

                await this.marketerService.update({
                    waId: wa_id,
                    field: 'ubication',
                    value: ubication
                })
                .then(async (response) => {
                    if (response.modifiedCount === 1) {
                        await this.metaProvider.sendText({
                            clientPhone,
                            message: 'Ahora necesito que me envies una foto de tu negocio, especificamente en la parte donde pegaste el QR de afiliacion.'
                        });
                    }
                })
                .catch(async (error) => {
                    await this.metaProvider.sendText({
                        clientPhone,
                        message: '⛔ Ocurrio un error al intentar actualizar la ubicacion del negocio, por favor, intentalo de nuevo :('
                    });

                    console.error(error);
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⚠️ Lo siento, la ubicacion que compartiste no es valida, por favor, intenta de nuevo.'
                });
            }
        } catch (error) {
            await this.sendError(data);
        }
    }

    public async validateImage(data: any) {
        try {
            const { message, contacts } = data;
            const { wa_id } = contacts;
            const { id } = message.image;
            const { phone } = data.message.from.phone;
            const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

            await this.metaProvider.sendText({
                clientPhone,
                message: '⌛ Validando imagen, espera un momento...'
            });

            if (message.type === WSP_MESSAGE_TYPES.IMAGE) {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '✅ Imagen valida!'
                });

                const imageUrl = await this.metaProvider.getWhatsappMediaUrl({ imageId: id });

                if (imageUrl) {
                    await this.marketerService.update({
                        waId: wa_id,
                        field: 'image',
                        value: imageUrl
                    })
                    .then(async() => {                
                        await this.metaProvider.sendText({
                            clientPhone,
                            message: 'Por ultimo, necesito que me compartas el codigo QR de afiliacion.'
                        });
                    })
                    .catch(async () => {
                        await this.metaProvider.sendText({
                            clientPhone,
                            message: '⛔ Ocurrio un error al intentar guardar la imagen, intentalo de nuevo :('
                        });
                    });
                }
        } else {
            await this.metaProvider.sendText({
                clientPhone,
                message: '⚠️ La imagen que compartiste no es valida, por favor, intentalo de nuevo.'
            });
        }
        } catch (error) {
            await this.sendError(data);
        }
    }

    public async validateQrCode(data: any) {
        try {
            const { message, contacts } = data;
            const { wa_id } = contacts;
            const { body } = message.text;
            const { phone } = data.message.from.phone;
            const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

            await this.metaProvider.sendText({
                clientPhone,
                message: '⌛ Validando codigo QR, espera un momento...',
            });

            // TODO: Investigar si hay validaciones espeficifcas para los QR de afiliacion
            if (body === '12345') {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '✅ Codigo valido!'
                });

                await this.marketerService.completeRegister({
                    waId: wa_id,
                    updateFields: {
                        qrCode: body,
                        status: Status.COMPLETE
                    }
                })
                .then(async () => {
                    // TODO: Verificar si los datos recuperados son los mismos que se almacenan en la API de qali-services
                    // const response = await this.marketerService.sendMarketer({ waId: wa_id });

                    // if (response) {
                        await this.metaProvider.sendText({
                            clientPhone,
                            message: '✅ Todos los datos se han completado, el mercadista se ha registrado con exito!'
                        });
                        // TODO: Investigar los numeros a los cuales debo notificar la creacion del mercadista asi como el tipo de mensaje que se tiene que envia, ya sea texto, plantilla, etc.
                    // } else {
                        await this.metaProvider.sendText({
                            clientPhone,
                            message: '⛔ Ocurrio un problema al intentar guardar el registro del mercadista, por favor, intentalo de nuevo.'
                        });
                    // }
                })
                .catch(async (error) => {
                    await this.metaProvider.sendText({
                        clientPhone,
                        message: '⛔ Ocurrio un problema al intentar actualizar el codigo QR del mercadista, por favor, intentalo de nuevo :('
                    });

                    console.error(error);
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⚠️ El codigo QR no es valido, por favor, intentalo de nuevo.'
                });
            }
        } catch (error) {
            await this.sendError(data);
        }
    }
}