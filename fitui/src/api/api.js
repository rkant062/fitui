import axios from 'axios';

export const apiUrl = process.env.REACT_APP_API_URL;

export const fetchData = () => axios.get(`${apiUrl}/api/data`);
export const addData = (data) => axios.post(`${apiUrl}/api/add-data`, data);
