//  Validar RUC (11 digitos)
export function validateRUC(rucNumber: string): boolean {
    const regexRUC = /^[0-9]{11}$/;
    return regexRUC.test(rucNumber);
}

//  Validar DNI (8 digitos)
export function validateDNI(dniNumber: string): boolean {
    const regexDNI = /^[0-9]{8}$/;
    return regexDNI.test(dniNumber);
}

// Validar valores de Latitud y Longitud
export function validateLatitudeAndLongitude(latitude: string, longitude: string): boolean {
    /**
     * NOTA: No logre encontrar expresiones regulares validas, asi que el metodo no funciona correctamente
     * Lo dejo por si mas adelante es necesario validar estrictamente, pero por ahora, la misma API de
     * WhatsApp nos devuelve si si o no ha identificado un mensaje de tipo location
     */
    const regexLatitude = /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/;
    const regexLongitude = /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/;

    return regexLatitude.test(latitude) && regexLongitude.test(longitude);
}

export function validatePhoneBusiness(phoneBusiness: string): boolean {
    const regexPeruPhone = /^(\51|0051|51)?[9]\d{8}$/;
    const regexMexicoPhone = /^(\52|0052|52)?(1)?[0-9]{10}$/;

    return regexPeruPhone.test(phoneBusiness) || regexMexicoPhone.test(phoneBusiness);
}