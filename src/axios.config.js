import axios from 'axios';
const defaultOptions = {
  baseURL: 'http://jota.nl:54321',
  headers: {
    'Content-Type': 'application/json'
  }
};

let axiosInstance = axios.create(defaultOptions);

export default axiosInstance;