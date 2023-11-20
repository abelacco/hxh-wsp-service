import { Injectable } from '@nestjs/common';
import { MetaProvider } from '../../provider/meta.provider';
import { WspMessage } from 'src/provider/types/wsp-message.interface';
import { MarketerService } from '../marketer.service';
import { validateDNI, validateRUC } from '../utils/validation';
import { WSP_MESSAGE_TYPES } from 'src/provider/constants/wsp-constants';
import { Status } from '../enums/status.enum';

@Injectable()
export class MarketerEvents {

    constructor(
        private metaProvider: MetaProvider,
        private readonly marketerService: MarketerService
    ) {}

    public async sendWelcome(data: WspMessage) {
        console.log('event MARKETER_START');
        const { message } = data;
        // const clientPhone = message.from.phone;
        const clientName = message.from.name

        await this.metaProvider.sendSimpleButtons({
            message: `Hola ${clientName}, Bienvenido al sistema de registro de mercadistas. ¿Deseas registrar un nuevo afiliado?`,
            clientPhone: '527731588611',
            listOfButtons: [
                {
                    title: 'CONTINUAR',
                    id: 'step-1-continuar'
                },
                {
                    title: 'CANCELAR',
                    id: 'step-1-cancelar'
                }
            ]
        });
    }

    public async sendError(data: any) {
        await this.metaProvider.sendText({
            clientPhone: '527731588611',
            message: 'Eso no es lo que esperaba, por favor, intentalo de nuevo'
        });
    }

    public async cancelRegister(data: any) {
        await this.metaProvider.sendText({
            clientPhone: '527731588611',
            message: 'Ok. Proceso cancelado!'
        });
    }

    public async requestRUCDNI(data: WspMessage) {
        console.log('event MARKETER_REQUEST_RUC_DNI');
        try {
            const { contacts } = data;
            const { wa_id, profile } = contacts;

            const marketer = await this.marketerService.findByWaId(wa_id);

            if (!marketer) {
                await this.marketerService.create({
                    clientName: profile.name,
                    waId: wa_id
                })
                .then(async () => {
                    await this.metaProvider.sendText({
                        message: 'Ok. A continacion, enviame el DNI o el RUC de tu negocio por favor',
                        clientPhone: '527731588611'
                    });
                })
                .catch(async (error) => {
                    await this.metaProvider.sendText({
                        clientPhone: '527731588611',
                        message: 'Ocurrio un error al iniciar el proceso de registro, intentalo de nuevo :('
                    });

                    console.error(error);
                });
            }
        } catch (error) {
            await this.sendError(data);
            await this.sendWelcome(data);
        }
    }

    public async validateRUCDNI(data: WspMessage) {
        try {
            const { message, contacts } = data;
            const { wa_id } = contacts;
            const rucDni = message.text.body;

            await this.metaProvider.sendText({
                message: 'Validando el RUC/DNI, espera un momento...',
                clientPhone: '527731588611'
            });

            if (validateDNI(rucDni) || validateRUC(rucDni)) {
                // TODO: Comunicarse con qali-services para enviarle el DNI/RUC
                // Si todo sale bien entonces guardar este dato en base de datos
                // y pedir el siguiente dato

                await this.metaProvider.sendText({
                    message: 'El DNI/RUC es valido!',
                    clientPhone: '527731588611'
                });

                await this.marketerService.update({
                    waId: wa_id,
                    field: "RUC",
                    value: rucDni
                })
                .then(async (response) => {
                    if (response.modifiedCount === 1) {
                        await this.metaProvider.sendText({
                            clientPhone: '527731588611',
                            message: 'Ahora, por favor, ¿Puedes decirme cual es el nombre de tu negocio'
                        });
                    }
                })
                .catch(async (error) => {
                    await this.metaProvider.sendText({
                        clientPhone: '527731588611',
                        message: 'Ocurrio un error al guardar el RUC/DNI, intentalo de nuevo :('
                    });

                    console.error(error);
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone: '527731588611',
                    message: 'El RUC/DNI no es valido, por favor intentalo de nuevo'
                });
            }
        } catch (error) {
            await this.sendError(data);
        }
    }

    public async validateName(data: WspMessage) {
        try {
            const { message, contacts } = data;
            const { wa_id } = contacts;
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
                            message: 'Excelente. Ahora necesito que me compartas la ubicacion GPS de tu negocio',
                            clientPhone: '527731588611'
                        });
                    }
                })
                .catch(async (error) => {
                    await this.metaProvider.sendText({
                        clientPhone: '527731588611',
                        message: 'Ocurrio un error al actualizar el nombre del negocio, intentalo de nuevo :('
                    });

                    console.error(error);
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone: '527731588611',
                    message: 'El nombre proporcionado no es valido, por favor, intentalo de nuevo'
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

            const ubication = {
                address,
                latitude,
                longitude,
                name,
                url
            }

            await this.metaProvider.sendText({
                message: 'Validando ubicacion, espera un momento...',
                clientPhone: '527731588611'
            });

            if (message.type === WSP_MESSAGE_TYPES.LOCATION) {
                await this.metaProvider.sendText({
                    message: 'Ubicacion valida.',
                    clientPhone: '527731588611'
                });

                await this.marketerService.update({
                    waId: wa_id,
                    field: 'ubication',
                    value: ubication
                })
                .then(async (response) => {
                    if (response.modifiedCount === 1) {
                        await this.metaProvider.sendText({
                            message: 'Ahora necesito que me envies una foto de tu negocio, especificamente en la parte donde pegaste el QR de afiliacion',
                            clientPhone: '527731588611'
                        });
                    }
                })
                .catch(async (error) => {
                    await this.metaProvider.sendText({
                        clientPhone: '527731588611',
                        message: 'Ocurrio un error al actualizar la ubicacion del negocio, por favor, intentalo de nuevo :('
                    });

                    console.error(error);
                });
            } else {
                await this.metaProvider.sendText({
                    message: 'Lo siento, la ubicacion que compartiste no es valida, por favor, intenta de nuevo',
                    clientPhone: '527731588611'
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

            await this.metaProvider.sendText({
                clientPhone: '527731588611',
                message: 'Validando imagen, espera un momento...'
            });

            if (message.type === WSP_MESSAGE_TYPES.IMAGE) {
                await this.metaProvider.sendText({
                    clientPhone: '527731588611',
                    message: 'Imagen valida!'
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
                            clientPhone: '527731588611',
                            message: 'Imagen almacenada'
                        });
                    
                        await this.metaProvider.sendText({
                            message: 'Por ultimo, necesito que me compartas el codigor QR de afiliacion',
                            clientPhone: '527731588611'
                        });
                    })
                    .catch(async () => {
                        await this.metaProvider.sendText({
                            clientPhone: '527731588611',
                            message: 'Ocurrio un error al intentar guardar la imagen, intentalo de nuevo :('
                        });
                    });
                }
        } else {
            await this.metaProvider.sendText({
                clientPhone: '527731588611',
                message: 'La imagen que compartiste no es valida, por favor, intentalo de nuevo'
            });
        }
        } catch (error) {
            await this.sendError(data);
        }
    }

    public async validateQrCode(data: WspMessage) {
        try {
            const { message, contacts } = data;
            const { wa_id } = contacts;
            const { body } = message.text;

            await this.metaProvider.sendText({
                message: 'Validando codigo QR, espera un momento...',
                clientPhone: '527731588611'
            });

            if (body === '12345') {
                await this.metaProvider.sendText({
                    clientPhone: '527731588611',
                    message: 'Codigo valido!'
                });

                await this.marketerService.completeRegister({
                    waId: wa_id,
                    updateFields: {
                        qrCode: body,
                        status: Status.COMPLETE
                    }
                })
                .then(async () => {
                    await this.metaProvider.sendText({
                        clientPhone: '527731588611',
                        message: 'Todos los datos se han completado, el mercadista se ha registrado con exito!'
                    });
                })
                .catch(async (error) => {
                    await this.metaProvider.sendText({
                        clientPhone: '527731588611',
                        message: 'Ocurrio un problema al actualizar el codigo QR del mercadista, intentalo de nuevo :('
                    });

                    console.error(error);
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone: '527731588611',
                    message: 'El codigo QR no es valido, por favor, intentalo de nuevo'
                });
            }
        } catch (error) {
            await this.sendError(data);
        }
    }
}