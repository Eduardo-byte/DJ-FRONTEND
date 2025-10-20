import axios from 'axios';
import { WEBSCRAPER_API_KEY } from './endpoints';

const webscrapperAxiosInstance = axios.create({
    headers: {
        'x-api-key': WEBSCRAPER_API_KEY
    },
});

export const logError = (error) => {
    console.error(error);
};


export default webscrapperAxiosInstance;
