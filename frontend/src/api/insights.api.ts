import client from './client';
import { InsightResponse, SimulationResponse } from '../types';

export const insightsApi = {
  getInsights: () => client.get<InsightResponse>('/insights'),
  simulate: (scenario: string) => client.post<SimulationResponse>('/simulate', { scenario }),
};
