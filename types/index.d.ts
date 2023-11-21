/**
 * Este es un truco que nos permite typescript para poder
 * acceder a las variables de entorno a traves del process.env
 * y dando autocompletado a traves de la notacion de punto "."
 */
declare namespace NodeJS {
    interface ProcessEnv {
        API_SERVICE: string;
        COHERE_API_KEY: string;
        CURRENT_ACCESS_TOKEN: string;
        MONGODB: string;
        MY_VERIFY_TOKEN: string;
        OPENAI_API_KEY: string;
        PHONE_ID: string;

        META_WA_wabaId: string;
        META_BASE_URL: string;
    }
}