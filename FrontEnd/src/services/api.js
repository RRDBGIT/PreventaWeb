import axios from 'axios';

// ✅ baseURL incluye /api → las rutas en los componentes NO deben llevar /api
const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
});

export default API;