import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { redis, connectRedis } from '../src/config/redis';
import { AgentCache } from '../src/cache/agentCache';

const app = createApp();

describe('Delivery Agent Management System - REST API & Cache Tests', () => {
  let createdAgentId: string;
  const testEmail = `test.agent.${Date.now()}@deliverypro.io`;

  beforeAll(async () => {
    await prisma.$connect();
    await connectRedis();
    // Clean up test data if any
    await prisma.agent.deleteMany({
      where: { email: { contains: 'test.agent' } },
    });
    await AgentCache.invalidateByPattern('agents:*');
    await AgentCache.invalidateByPattern('agent:*');
  });

  afterAll(async () => {
    // Clean up
    if (createdAgentId) {
      await prisma.agent.deleteMany({ where: { id: createdAgentId } });
    }
    await prisma.agent.deleteMany({
      where: { email: { contains: 'test.agent' } },
    });
    await prisma.$disconnect();
    try {
      await redis.quit();
    } catch {}
  });

  describe('GET /api/health', () => {
    it('should return 200 and healthy service statuses', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.services.database).toBe('connected');
    });
  });

  describe('POST /api/agents (Create Agent)', () => {
    it('should create a new delivery agent with valid payload', async () => {
      const res = await request(app)
        .post('/api/agents')
        .send({
          fullName: 'Test Agent Alpha',
          phone: '+91 99999 88888',
          email: testEmail,
          serviceArea: 'Koramangala, Bangalore',
          status: 'ACTIVE',
          vehicleType: 'Electric Scooter',
          vehicleNumber: 'KA-01-TX-9999',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.fullName).toBe('Test Agent Alpha');
      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data.status).toBe('ACTIVE');

      createdAgentId = res.body.data.id;
    });

    it('should reject creation with missing required fields (400)', async () => {
      const res = await request(app)
        .post('/api/agents')
        .send({
          fullName: 'Incomplete Agent',
          // Missing phone, email, serviceArea
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject creation with invalid email format (400)', async () => {
      const res = await request(app)
        .post('/api/agents')
        .send({
          fullName: 'Bad Email Agent',
          phone: '9876543210',
          email: 'not-an-email',
          serviceArea: 'Delhi',
          status: 'ACTIVE',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject creation with duplicate email (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/agents')
        .send({
          fullName: 'Duplicate Agent',
          phone: '+91 98765 11111',
          email: testEmail,
          serviceArea: 'Indiranagar',
          status: 'ACTIVE',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('GET /api/agents (List & Redis Caching)', () => {
    it('should fetch list on first call with Cache MISS', async () => {
      // Invalidate list first to guarantee miss
      await AgentCache.invalidateByPattern('agents:list*');

      const res = await request(app).get('/api/agents?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.headers['x-cache']).toBe('MISS');
      expect(res.body.pagination).toBeDefined();
    });

    it('should serve subsequent call from Redis with Cache HIT', async () => {
      const res = await request(app).get('/api/agents?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['x-cache']).toBe('HIT');
      expect(res.body.cached).toBe(true);
    });

    it('should support search query filter', async () => {
      const res = await request(app).get(`/api/agents?search=${encodeURIComponent('Test Agent Alpha')}`);
      expect(res.status).toBe(200);
      expect(res.body.data.some((a: any) => a.id === createdAgentId)).toBe(true);
    });

    it('should support status filtering', async () => {
      const res = await request(app).get('/api/agents?status=ACTIVE');
      expect(res.status).toBe(200);
      expect(res.body.data.every((a: any) => a.status === 'ACTIVE')).toBe(true);
    });
  });

  describe('GET /api/agents/:id (Single Agent)', () => {
    it('should return agent details and cache on miss then hit on second call', async () => {
      // First call (MISS)
      const res1 = await request(app).get(`/api/agents/${createdAgentId}`);
      expect(res1.status).toBe(200);
      expect(res1.body.data.id).toBe(createdAgentId);
      expect(res1.headers['x-cache']).toBe('MISS');

      // Second call (HIT)
      const res2 = await request(app).get(`/api/agents/${createdAgentId}`);
      expect(res2.status).toBe(200);
      expect(res2.headers['x-cache']).toBe('HIT');
      expect(res2.body.data.id).toBe(createdAgentId);
    });

    it('should return 404 for non-existent UUID', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).get(`/api/agents/${fakeUuid}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid UUID format', async () => {
      const res = await request(app).get('/api/agents/invalid-not-uuid');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/agents/:id (Update Agent & Cache Invalidation)', () => {
    it('should update agent and invalidate caches', async () => {
      const updatePayload = {
        fullName: 'Test Agent Alpha Updated',
        serviceArea: 'Whitefield Tech Park',
        phone: '+91 88888 77777',
      };

      const res = await request(app)
        .put(`/api/agents/${createdAgentId}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('Test Agent Alpha Updated');
      expect(res.body.data.serviceArea).toBe('Whitefield Tech Park');

      // Verify that cache for this single agent was invalidated -> next GET must be MISS
      const singleRes = await request(app).get(`/api/agents/${createdAgentId}`);
      expect(singleRes.headers['x-cache']).toBe('MISS');
      expect(singleRes.body.data.fullName).toBe('Test Agent Alpha Updated');

      // Verify that list cache was also invalidated -> next GET /api/agents?page=1&limit=5 must be MISS
      const listRes = await request(app).get('/api/agents?page=1&limit=5');
      expect(listRes.headers['x-cache']).toBe('MISS');
    });

    it('should return 404 when updating non-existent agent', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .put(`/api/agents/${fakeUuid}`)
        .send({ fullName: 'Nobody' });

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/agents/:id/status (Toggle Status)', () => {
    it('should update status and invalidate cache', async () => {
      const res = await request(app)
        .patch(`/api/agents/${createdAgentId}/status`)
        .send({ status: 'INACTIVE' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('INACTIVE');
    });
  });

  describe('DELETE /api/agents/:id (Delete Agent & Cache Invalidation)', () => {
    it('should delete agent and invalidate cache', async () => {
      const res = await request(app).delete(`/api/agents/${createdAgentId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify agent is gone
      const getRes = await request(app).get(`/api/agents/${createdAgentId}`);
      expect(getRes.status).toBe(404);

      createdAgentId = '';
    });

    it('should return 404 when deleting already deleted or non-existent agent', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).delete(`/api/agents/${fakeUuid}`);
      expect(res.status).toBe(404);
    });
  });
});
