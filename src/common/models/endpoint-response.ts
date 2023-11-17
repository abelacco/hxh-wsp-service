enum successStatus {
    'ERROR' = 0,    
    'OK' = 1
}

export class EndpointResponse {
    success: successStatus;
    data: any;
    message: string;
}