import axios from 'axios';

// ✅ baseURL incluye /api → las rutas en los componentes NO deben llevar /api
const API = axios.create({
    //baseURL: 'http://192.168.1.31:5000/api',
    baseURL:'https://preventaweb-api.onrender.com/api',
    timeout: 10000,
});

export default API;