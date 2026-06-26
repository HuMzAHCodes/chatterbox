import request from 'supertest';
import app from '../../index.js';

describe('Health Check', () => {
  it('GET /api/health should return 200 with success true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Server is running');
  });

  it('GET /api/nonexistent should return 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});