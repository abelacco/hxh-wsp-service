import { Injectable } from '@nestjs/common';
import { MetaProvider } from '../../provider/meta.provider';
import { MarketerService } from '../marketer.service';
import { validateDNI, validateRUC, validatePhoneBusiness } from '../utils/validation';
import { WSP_MESSAGE_TYPES } from 'src/provider/constants/wsp-constants';
import { Status } from '../enums/status.enum';
import axios from 'axios';

@Injectable()
export class MarketerEvents {

    constructor(
        private metaProvider: MetaProvider,
        private readonly marketerService: MarketerService
    ) {}

    // TODO: Definir el tipoado del WspMessage para reemplazar los any
    public async sendWelcome(data: any) {
        console.log('event MARKETER_START');
        try {
            const { message, contacts } = data;
            const { wa_id } = contacts;
            // TODO: Modificar el formato del mensaje parseado para que 'phone' no venga anidado
            //? NOTA: La linea que modifica la lada del numero es solo para poder hacer pruebas en produccion desde México
            const { phone } = message.from.phone;
            const clientName = message.from.name
            const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

            const affiliateExists = await this.marketerService.existsAffiliater({ waId: wa_id });

            if (affiliateExists) {
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
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⛔ Lo siento, este telefono no esta registrado como un Hunter de Qali por lo que no tienes permitido afiliar mercadistas.'
                });
            }
        } catch (error) {
            console.error('MarketerEvent -> sendWelcome:', error.code);
            await this.sendError(data);
        }

    }

    public async sendError(data: any) {
        const { phone } = data.message.from.phone;
        const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

        await this.metaProvider.sendText({
            clientPhone,
            message: '⚠️ Eso no es lo que esperaba, por favor, intentalo de nuevo'
        });

        await this.sendCancelAffiliate(data);
    }

    public async sendCancelAffiliate(data: any) {
        const { message } = data;
        const { phone } = message.from.phone;
        const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

        await this.metaProvider.sendSimpleButtons({
            message: 'O si lo deseas, puedes cancelar todo el proceso dando click aqui.',
            clientPhone,
            listOfButtons: [
                {
                    title: '❌CANCELAR AFILIACION',
                    id: 'step-1-cancelar-afiliacion'
                }
            ]
        });
    }

    public async cancelAffiliate(data: any) {
        try {
            const { message, contacts } = data;
            const { wa_id } = contacts;
            const { phone } = message.from.phone;
            const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

            const result = await this.marketerService.deleteOne({ waId: wa_id });

            if (result.deletedCount === 1) {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '❌ Afiliacion cancelada'
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⛔ Ocurrio un error al intentar cancelar la afiliacion, por favor, intentalo mas tarde.'
                });
            }
        } catch (error) {
            console.error('MarketerEvent -> cancelAffiliate ->', error.code);
        }
    }

    public async cancelRegister(data: any) {
        const { phone } = data.message.from.phone;
        const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

        await this.metaProvider.sendText({
            clientPhone,
            message: '❌ Ok. Proceso cancelado!'
        });
    }

    public async validateExistsStore(waId: string, clientPhone: string, rucOrDni: string, data?: any): Promise<boolean> {
        try {
            const store = await this.marketerService.existsStore({ documentId: rucOrDni });

            if (store === undefined) return false;

            const { documentId, fullname, phone, affiliateId } = store;
            const affiliater = await this.marketerService.findAffiliater({ affiliateId });

            const marketerBody = `⛔ El mercadista ya se encuentra afiliado con los datos: \n Numero de identificacion: ${documentId} \n Nombre: ${fullname} \n Telefono: ${phone} \n Afiliado por: ${affiliater.fullname}`;

            await this.metaProvider.sendText({
                clientPhone,
                message: marketerBody
            });

            const response = await this.marketerService.deleteOne({ waId });

            if (response.deletedCount === 1) {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '❌ Proceso cancelado.'
                });
            }

            return true;
        } catch (error) {
            console.error('MarketerEvent -> validateExistsStore ->', error.code);
        }
    }

    public async validateNumberIsAffiliate(waId: string, clientPhone: string, phoneBusiness: string, data?:any): Promise<boolean> {
        try {
            const response = await this.marketerService.numberIsAffiliate({ phoneBusiness });

            if (response === undefined) return false;

            const { documentId, fullname, phone, affiliateId } = response;
            console.log('affiliateId:', affiliateId);
            const affiliater = await this.marketerService.findAffiliater({ affiliateId });

            const marketerBody = `⛔ Este numero ya se encuentra afiliado con los siguientes datos: \n Numero de identificacion: ${documentId} \n Nombre: ${fullname} \n Telefono: ${phone} \n Afiliado por: ${affiliater.fullname}`;

            await this.metaProvider.sendText({
                clientPhone,
                message: marketerBody
            });

            const result = await this.marketerService.deleteOne({ waId });

            if (result.deletedCount === 1) {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '❌ Proceso cancelado.'
                });
            }

            return true;
        } catch (error) {
            console.error('MarketerEvent -> validateNumberIsAffiliate ->', error.code);
        }
    }

    public async requestRUCDNI(data: any) {
        console.log('event MARKETER_REQUEST_RUC_DNI');
        try {
            const { contacts } = data;
            const { wa_id } = contacts;
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

                    await this.sendCancelAffiliate(data);
                    throw error;
                });
            } else {
                console.log('MarketerEvent -> requestRUCDNI -> Ya existe un registro en memoria');
            }
        } catch (error) {
            console.error('MarketerEvent -> requestRUCDNI ->', error.code);
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

            if (await this.validateExistsStore(wa_id, clientPhone, rucOrDni)) return;

            if (validateDNI(rucOrDni) || validateRUC(rucOrDni)) {
                await axios.get(`${process.env.API_SERVICE}/apiperu?idNumber=${rucOrDni}`)
                    .then(async (response) => {
                        if (response.data.ruc || response.data.dni) {
                            await this.metaProvider.sendText({
                                clientPhone,
                                message: '✅ El RUC/DNI es valido!'
                            });

                            await this.marketerService.update({
                                waId: wa_id,
                                field: 'documentId',
                                value: rucOrDni
                            })
                            .then(async (response) => {
                                if (response.modifiedCount === 1) {
                                    await this.metaProvider.sendText({
                                        clientPhone,
                                        message: 'Ahora, por favor, ¿Puedes decirme cual es el nombre de tu negocio?'
                                    });
                                } else {
                                    await this.metaProvider.sendText({
                                        clientPhone,
                                        message: '⛔ El RUC/DNI no se pudo actualizar, por favor, intentalo de nuevo.'
                                    });

                                    await this.sendCancelAffiliate(data);
                                }
                            })
                            .catch(async (error) => {
                                await this.metaProvider.sendText({
                                    clientPhone,
                                    message: '⛔ Ocurrio un error al guardar el RUC/DNI, por favor, intentalo de nuevo :('
                                });

                                await this.sendCancelAffiliate(data);
                            });
                        } else {
                            await this.metaProvider.sendText({
                                clientPhone,
                                message: '⚠️ No se encontro ningun registro asociado al RUC/DNI proporcionado, por favor, intentalo de nuevo.'
                            });

                            await this.sendCancelAffiliate(data);
                        }
                    })
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⚠️ El RUC/DNI no es valido, por favor, intentalo de nuevo.'
                });

                await this.sendCancelAffiliate(data);
            }
        } catch (error) {
            console.error('MarketerEvent -> validateRUCDNI ->', error.code);
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
                    field: 'fullname',
                    value: businessName
                })
                .then(async (response) => {
                    if (response.modifiedCount === 1) {
                        await this.metaProvider.sendText({
                            clientPhone,
                            message: 'Excelente. Ahora necesito que me compartas el numero telefonico del dueño del negocio. No olvides incluir la lada. Ejemplo: 51912123456.'
                        });
                    }
                })
                .catch(async (error) => {
                    await this.metaProvider.sendText({
                        clientPhone,
                        message: '⛔ Ocurrio un error al intentar actualizar el nombre del negocio, por favor, intentalo de nuevo :('
                    });

                    await this.sendCancelAffiliate(data);
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⚠️ El nombre proporcionado no es valido, por favor, intentalo de nuevo.'
                });

                await this.sendCancelAffiliate(data);
            }
        } catch (error) {
            console.error('MarketerEvent -> validateName ->', error.code);
            await this.sendError(data);
        }
    }

    public async validatePhoneBusiness(data: any) {
        try {
            const { message, contacts } = data;
            const { wa_id } = contacts;
            const { phone } = message.from.phone;
            const { body } = message.text;
            const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

            await this.metaProvider.sendText({
                clientPhone,
                message: '⌛ Validando numero telefonico, espera un momento...'
            });

            if (await this.validateNumberIsAffiliate(wa_id, clientPhone, body)) return;

            if (validatePhoneBusiness(body)) {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '✅ Numero valido!'
                });

                await this.marketerService.update({
                    waId: wa_id,
                    field: 'phoneBusiness',
                    value: body
                })
                .then(async (response) => {
                    if (response.modifiedCount === 1) {
                        await this.metaProvider.sendText({
                            clientPhone,
                            message: 'Lo siguiente es que me compartas la ubicacion GPS de tu negocio.'
                        });
                    }
                })
                .catch(async () => {
                    await this.metaProvider.sendText({
                        clientPhone,
                        message: '⛔ Ocurrio un error al intentar actualizar el telefono del negocio, por favor, intentalo de nuevo.'
                    });

                    await this.sendCancelAffiliate(data);
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⚠️ El numero que compartiste no pertenece a un numero telefonico valido para el territorio de Perú, por favor intentalo de nuevo.'
                });

                await this.sendCancelAffiliate(data);
            }
        } catch (error) {
            console.error('MarketerEvent -> validatePhoneBusiness ->', error.code);
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

            if (message.messageType === WSP_MESSAGE_TYPES.LOCATION) {
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

                    await this.sendCancelAffiliate(data);
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⚠️ Lo siento, la ubicacion que compartiste no es valida, por favor, intenta de nuevo.'
                });

                await this.sendCancelAffiliate(data);
            }
        } catch (error) {
            console.error('MarketerEvent -> validateUbication ->', error.code);
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

            if (message.messageType === WSP_MESSAGE_TYPES.IMAGE) {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '✅ Imagen valida!'
                });

                const imageUrl = await this.metaProvider.getWhatsappMediaUrl({ imageId: id });

                if (imageUrl) {
                    await this.marketerService.update({
                        waId: wa_id,
                        field: 'imageUrl',
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

                        await this.sendCancelAffiliate(data);
                    });
                }
        } else {
            await this.metaProvider.sendText({
                clientPhone,
                message: '⚠️ La imagen que compartiste no es valida, por favor, intentalo de nuevo.'
            });

            await this.sendCancelAffiliate(data);
        }
        } catch (error) {
            console.error('MarketerEvent -> validateImage ->', error.code);
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

            // TODO: Modificar cuando se tenga la instruccion de como se validan los codigos QR
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
                    await this.completeMarketerRegister(data);
                })
                .catch(async (error) => {
                    await this.metaProvider.sendText({
                        clientPhone,
                        message: '⛔ Ocurrio un problema al intentar actualizar el codigo QR del mercadista, por favor, intentalo de nuevo :('
                    });

                    await this.sendCancelAffiliate(data);
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⚠️ El codigo QR no es valido, por favor, intentalo de nuevo.'
                });

                await this.sendCancelAffiliate(data);
            }
        } catch (error) {
            console.error('MarketerEvent -> validateQrCode ->', error.code);
            await this.sendError(data);
        }
    }

    public async completeMarketerRegister(data: any) {
        try {
            const { contacts } = data;
            const { wa_id } = contacts;
            const { phone } = data.message.from.phone;
            const clientPhone = phone.startsWith('52') ? phone.replace('521', '52') : phone;

            const response = await this.marketerService.sendMarketer({ waId: wa_id });

            if (response) {
                const businessPhone = response.phone.startsWith('52') ? response.phone.replace('521', '52') : response.phone;
            
                const { documentId, fullname, phone, affiliateId } = response;
                const affiliater = await this.marketerService.findAffiliater({ affiliateId });

                const marketerBody = `Estos son los datos del mercadista registrado: \n Numero de identificacion: ${documentId} \n Nombre: ${fullname} \n Telefono: ${phone} \n Afiliado por: ${affiliater.fullname}`;
            
                const result = await this.marketerService.deleteOne({ waId: wa_id });

                if (result.deletedCount === 1) {
                    console.log('MarketerEvent -> completeMarketerRegister -> Registro en memoria eliminado');
                }

                await this.metaProvider.sendText({
                    clientPhone,
                    message: '✅ Todos los datos se han completado, el mercadista se ha registrado con exito!'
                });

                await this.metaProvider.sendText({
                    clientPhone: businessPhone,
                    message: '✅ Mercadista registrado con exito!'
                });
                await this.metaProvider.sendText({
                    clientPhone: businessPhone,
                    message: marketerBody
                });
            } else {
                await this.metaProvider.sendText({
                    clientPhone,
                    message: '⛔ Ocurrio un problema al intentar guardar el registro del mercadista, por favor, intentalo de nuevo.'
                });

                await this.sendCancelAffiliate(data);
            }
        } catch (error) {
            console.error('MarketerEvent -> completeMarketerRegister ->', error.code);
        }
    }
}