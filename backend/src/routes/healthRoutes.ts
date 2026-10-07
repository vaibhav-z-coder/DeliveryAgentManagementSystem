import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { isRedisConnected, redis } from '../config/redis';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  let redisStatus = isRedisConnected ? 'connected' : 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  if (isRedisConnected) {
    try {
      const pong = await redis.ping();
      if (pong === 'PONG') {
        redisStatus = 'connected';
      }
    } catch {
      redisStatus = 'disconnected';
    }
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    message: isHealthy ? 'API is healthy' : 'One or more downstream services are degraded',
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
