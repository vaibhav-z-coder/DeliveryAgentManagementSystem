import { redis, isRedisConnected } from '../config/redis';
import { env } from '../config/env';

export class AgentCache {
  private static readonly TTL = env.REDIS_TTL;

  public static getListKey(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    const queryPart = sortedKeys
      .filter((k) => params[k] !== undefined && params[k] !== '')
      .map((k) => `${k}=${encodeURIComponent(String(params[k]))}`)
      .join(':');
    return `agents:list${queryPart ? `:${queryPart}` : ''}`;
  }

  public static getAgentKey(id: string): string {
    return `agent:${id}`;
  }

  public static getStatsKey(): string {
    return 'agents:stats';
  }

  public static async get<T>(key: string): Promise<T | null> {
    if (!isRedisConnected) return null;
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err: any) {
      console.warn(`[Redis Cache GET Error] Key ${key}: ${err.message}`);
      return null;
    }
  }

  public static async set(key: string, value: any, ttlSeconds = AgentCache.TTL): Promise<void> {
    if (!isRedisConnected) return;
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err: any) {
      console.warn(`[Redis Cache SET Error] Key ${key}: ${err.message}`);
    }
  }

  public static async del(key: string): Promise<void> {
    if (!isRedisConnected) return;
    try {
      await redis.del(key);
    } catch (err: any) {
      console.warn(`[Redis Cache DEL Error] Key ${key}: ${err.message}`);
    }
  }

  public static async invalidateByPattern(pattern: string): Promise<number> {
    if (!isRedisConnected) return 0;
    try {
      let cursor = '0';
      let deletedCount = 0;
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          const count = await redis.del(...keys);
          deletedCount += count;
        }
      } while (cursor !== '0');
      return deletedCount;
    } catch (err: any) {
      console.warn(`[Redis Invalidate Pattern Error] Pattern ${pattern}: ${err.message}`);
      return 0;
    }
  }

  /**
   * Invalidate all agent lists and stats when an agent is created
   */
  public static async onAgentCreated(): Promise<void> {
    await Promise.all([
      this.invalidateByPattern('agents:list*'),
      this.del(this.getStatsKey()),
    ]);
  }

  /**
   * Invalidate specific agent, all agent lists and stats when an agent is updated
   */
  public static async onAgentUpdated(id: string): Promise<void> {
    await Promise.all([
      this.del(this.getAgentKey(id)),
      this.invalidateByPattern('agents:list*'),
      this.del(this.getStatsKey()),
    ]);
  }

  /**
   * Invalidate specific agent, all agent lists and stats when an agent is deleted
   */
  public static async onAgentDeleted(id: string): Promise<void> {
    await Promise.all([
      this.del(this.getAgentKey(id)),
      this.invalidateByPattern('agents:list*'),
      this.del(this.getStatsKey()),
    ]);
  }
}
