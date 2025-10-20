import axios from 'axios';
import { SOCIAL_API_KEY } from './endpoints';

const socialAxiosInstance = axios.create({
    headers: {
        'x-api-key': SOCIAL_API_KEY
    },
});

export const logError = (error) => {
    console.error(error);
};


export default socialAxiosInstance;
