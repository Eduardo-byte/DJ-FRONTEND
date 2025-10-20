import axios from 'axios';
import { API_URL_KEY } from './endpoints';

const axiosInstance = axios.create({
    headers: {
        'apiKey': API_URL_KEY
    },
});

export const logError = (error) => {
    console.error(error);
};


export default axiosInstance;
