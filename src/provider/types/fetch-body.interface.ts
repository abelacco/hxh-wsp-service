import { AxiosRequestHeaders } from "axios";

export interface FetchAssistantBody {
    baseUrl?: string,
    url: string,
    method: string,
    headers?: AxiosRequestHeaders,
    body: Object
}