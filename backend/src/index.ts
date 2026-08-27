import { env } from './config/env';
import { createApp } from './app';
import { prisma } from './lib/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 [BACKEND] Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(`📡 [HEALTH] Health check available at http://localhost:${env.PORT}/health`);
});

// Graceful shutdown handling
const handleShutdown = async (signal: string) => {
  console.log(`\n🛑 [SHUTDOWN] Received ${signal}. Closing HTTP server and database connections...`);
  
  server.close(async () => {
    console.log('🔒 [HTTP] Express server stopped accepting new connections.');
    try {
      await prisma.$disconnect();
      console.log('🗄️ [PRISMA] Disconnected from PostgreSQL database.');
      process.exit(0);
    } catch (err) {
      console.error('❌ [ERROR] Error during Prisma disconnection:', err);
      process.exit(1);
    }
  });

  // Force close after 10s if graceful close fails
  setTimeout(() => {
    console.error('⚠️ [SHUTDOWN] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
