import axios from 'axios';

const api = axios.create({
  baseURL: `${
    process.env.REACT_APP_API_URL
  }?_=${new Date().getTime()}`,
});

export default api;
