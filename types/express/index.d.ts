/**
 * Esto nos va a permitir inyectar datos dentro
 * de la request para que puedan ser usados en
 * los controladores a los cuales llega este dato
 * 
 * NOTA: Este tipo de tipado no permite los tipos
 * personalizados, solo los nativos
 */

declare namespace Express {
    interface Request {
        marketerField: string;
    }
}