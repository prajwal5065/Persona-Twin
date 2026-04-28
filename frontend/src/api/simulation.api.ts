import client from './client';
import type { SimulationResponse } from '../types';

export const simulationApi = {
  simulate: (scenario: string) => client.post<SimulationResponse>('/simulate', { scenario }),
};
