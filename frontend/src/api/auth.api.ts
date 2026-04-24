import client from './client';

export const authApi = {
  login: (data: any) => client.post('/auth/login', new URLSearchParams(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  register: (data: any) => client.post('/auth/register', data),
  getMe: () => client.get('/auth/me'),
};
