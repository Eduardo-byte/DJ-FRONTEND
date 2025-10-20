import axios from 'axios';
import { API_GATEWAY_JWT } from './endpoints';

const apiGatewayAxiosInstance = axios.create({
    headers: {
        'Authorization': `Bearer ${API_GATEWAY_JWT}`,
        'accept': 'application/json'
    },
});

export const logError = (error) => {
    console.error(error);
};


export default apiGatewayAxiosInstance;
