import axios, { AxiosInstance } from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api');

const API: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Increase timeout to allow model loading / processing (60s)
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const analyzeAudio = (file: File): Promise<any> => {
  if (!file) {
    return Promise.reject(new Error('File is required'));
  }

  const formData = new FormData();
  formData.append('audio', file);

  return API.post('/analyze-audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default API;
