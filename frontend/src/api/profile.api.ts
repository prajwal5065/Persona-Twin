import client from './client';

export const profileApi = {
  getPersonality: () => client.get('/profile/personality'),
};
