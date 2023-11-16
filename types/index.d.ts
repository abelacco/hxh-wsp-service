/**
 * Este es un truco que nos permite typescript para poder
 * acceder a las variables de entorno a traves del process.env
 * y dando autocompletado a traves de la notacion de punto "."
 */
declare namespace NodeJS {
    interface ProcessEnv {
        OPENAI_API_KEY: string;
        MONGODB: string;
        PHONE_ID: string;
        META_WA_wabaId: string;
        MY_VERIFY_TOKEN: string;
        CURRENT_ACCESS_TOKEN: string;
        META_BASE_URL: string;
    }
}