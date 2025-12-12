import axios from 'axios';

// ✅ baseURL incluye /api → las rutas en los componentes NO deben llevar /api
const API = axios.create({ 
    baseURL: 'https://preventaweb-api.onrender.com/api', 
    timeout: 10000,
});

export default API;