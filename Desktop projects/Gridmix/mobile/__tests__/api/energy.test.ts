/**
 * API Integration Tests for GridMix Backend
 *
 * These tests validate the API contract and response formats.
 * Run against a local or staging backend.
 */

import axios from 'axios';

const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

describe('Energy API', () => {
  describe('GET /energy/current', () => {
    it('returns current energy data with correct schema', async () => {
      const response = await api.get('/energy/current');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('timestamp');
      expect(response.data).toHaveProperty('totalDemand');
      expect(response.data).toHaveProperty('carbonIntensity');
      expect(response.data).toHaveProperty('energyMix');

      // Validate energy mix structure
      const { energyMix } = response.data;
      expect(energyMix).toHaveProperty('wind');
      expect(energyMix).toHaveProperty('solar');
      expect(energyMix).toHaveProperty('nuclear');
      expect(energyMix).toHaveProperty('gas');
      expect(energyMix).toHaveProperty('coal');
      expect(energyMix).toHaveProperty('hydro');
      expect(energyMix).toHaveProperty('biomass');
      expect(energyMix).toHaveProperty('imports');
    });

    it('returns reasonable data values', async () => {
      const response = await api.get('/energy/current');

      expect(response.data.totalDemand).toBeGreaterThan(0);
      expect(response.data.carbonIntensity).toBeGreaterThanOrEqual(0);
      expect(response.data.carbonIntensity).toBeLessThan(1000);

      // Validate timestamp is recent (within 1 hour)
      const timestamp = new Date(response.data.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - timestamp.getTime();
      expect(diffMs).toBeLessThan(60 * 60 * 1000); // 1 hour
    });

    it('includes correct content-type header', async () => {
      const response = await api.get('/energy/current');

      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('GET /energy/history', () => {
    it('returns historical energy data array', async () => {
      const response = await api.get('/energy/history?hours=24');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('respects hours parameter', async () => {
      const response = await api.get('/energy/history?hours=1');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });
});

describe('Carbon Forecast API', () => {
  describe('GET /carbon-forecast', () => {
    it('returns forecast with correct schema', async () => {
      const response = await api.get('/carbon-forecast');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('forecast');
      expect(Array.isArray(response.data.forecast)).toBe(true);

      // Validate forecast item structure
      if (response.data.forecast.length > 0) {
        const item = response.data.forecast[0];
        expect(item).toHaveProperty('timestamp');
        expect(item).toHaveProperty('forecast');
        expect(typeof item.forecast).toBe('number');
      }
    });

    it('includes cleanest periods', async () => {
      const response = await api.get('/carbon-forecast');

      expect(response.data).toHaveProperty('cleanest_periods');
      expect(Array.isArray(response.data.cleanest_periods)).toBe(true);
    });
  });

  describe('GET /carbon-forecast/cleanest', () => {
    it('returns array of cleanest periods', async () => {
      const response = await api.get('/carbon-forecast/cleanest');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data.length > 0) {
        const period = response.data[0];
        expect(period).toHaveProperty('start_time');
        expect(period).toHaveProperty('end_time');
        expect(period).toHaveProperty('avg_intensity');
      }
    });
  });
});

describe('REPD Projects API', () => {
  describe('GET /repd/projects', () => {
    it('returns array of projects', async () => {
      const response = await api.get('/repd/projects?limit=5');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('projects have required fields', async () => {
      const response = await api.get('/repd/projects?limit=1');

      if (response.data.length > 0) {
        const project = response.data[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('projectName');
        expect(project).toHaveProperty('technologyType');
        expect(project).toHaveProperty('installedCapacity');
      }
    });

    it('respects limit parameter', async () => {
      const response = await api.get('/repd/projects?limit=3');

      expect(response.data.length).toBeLessThanOrEqual(3);
    });
  });
});

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('returns healthy status', async () => {
      const response = await api.get('/health');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('healthy');
      expect(response.data.healthy).toBe(true);
    });
  });
});

describe('Security', () => {
  describe('Admin endpoints require authentication', () => {
    it('POST /energy/refresh returns 401 without auth', async () => {
      try {
        await api.post('/energy/refresh');
        fail('Should have thrown 401 error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('Unauthorized');
      }
    });

    it('POST /repd/update returns 401 without auth', async () => {
      try {
        await api.post('/repd/update');
        fail('Should have thrown 401 error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('Input validation', () => {
    it('rejects invalid email format', async () => {
      try {
        await api.post('/newsletter/subscribe', { email: 'invalid' });
        fail('Should have rejected invalid email');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('Invalid email');
      }
    });
  });

  describe('Rate limiting headers', () => {
    it('includes rate limit headers', async () => {
      const response = await api.get('/energy/current');

      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
    });
  });
});
