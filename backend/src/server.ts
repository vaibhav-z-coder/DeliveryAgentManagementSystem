import { app } from './app';
import { env } from './config/env';
import { connectPrisma, prisma } from './config/prisma';
import { connectRedis, redis } from './config/redis';

async function bootstrap() {
  console.log('🚀 Starting Delivery Agent Management System Backend...');

  // Initialize DB and Cache connections
  try {
    await connectPrisma();
  } catch (error) {
    console.error('Fatal: Could not connect to PostgreSQL database. Exiting.');
    process.exit(1);
  }

  await connectRedis();

  const server = app.listen(env.PORT, () => {
    console.log(`\n==================================================`);
    console.log(`⚡ Server running on http://localhost:${env.PORT}`);
    console.log(`📡 Health Check:     http://localhost:${env.PORT}/api/health`);
    console.log(`📦 Agent API:       http://localhost:${env.PORT}/api/agents`);
    console.log(`📊 Stats API:       http://localhost:${env.PORT}/api/agents/stats`);
    console.log(`==================================================\n`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      await prisma.$disconnect();
      console.log('PostgreSQL connection disconnected.');
      try {
        await redis.quit();
        console.log('Redis connection closed.');
      } catch {}
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap();
