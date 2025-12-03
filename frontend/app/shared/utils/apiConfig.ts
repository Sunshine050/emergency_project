import { OpenAPI } from '../../../lib/api-client';

export const configureApiClient = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      OpenAPI.TOKEN = token;
    }
    // Pointing to real backend - .env already includes /api
    OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }
};
