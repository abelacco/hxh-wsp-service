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