const Redis = require('ioredis');

let redis = null;

const getRedisClient = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null, // Required for BullMQ compatibility
      enableReadyCheck: false,
      family: 4, // Force IPv4 to prevent IPv6 ETIMEDOUT
      connectTimeout: 20000,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });

    redis.on('connect', () => {
      console.log('Redis connected');
    });

    redis.on('error', (err) => {
      console.error('Redis error:', err.message);
    });
  }

  return redis;
};

module.exports = { getRedisClient };
