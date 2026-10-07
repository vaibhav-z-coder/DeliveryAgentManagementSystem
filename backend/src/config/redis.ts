import Redis from 'ioredis';
import { env } from './env';

export let isRedisConnected = false;

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  lazyConnect: true,
  enableOfflineQueue: true,
});

redis.on('connect', () => {
  isRedisConnected = true;
  console.log('✓ Redis connected successfully');
});

redis.on('ready', () => {
  isRedisConnected = true;
});

redis.on('error', (err) => {
  isRedisConnected = false;
  console.warn('⚠ Redis connection warning:', err.message);
});

redis.on('close', () => {
  isRedisConnected = false;
});

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (error: any) {
    console.warn('⚠ Redis initial connection failed, proceeding with cache fallback:', error.message);
  }
}
