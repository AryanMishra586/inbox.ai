import config from "../config";
import IORedis from "ioredis";
import type { Redis } from "ioredis";
import type { RedisOptions } from "bullmq";

class RedisClient {
  private client: Redis;

  constructor() {
    this.client = new IORedis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT || 6379),
    });

    this.client.on("connect", () => {
      console.log("Connected to Redis");
    });

    this.client.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
  }

  async set(
    key: string,
    value: string,
    expireInSeconds?: number
  ): Promise<void> {
    try {
      if (expireInSeconds) {
        await this.client.set(key, value, "EX", expireInSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      console.error("Error setting value in Redis:", err);
      throw err;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error("Error getting value from Redis:", err);
      throw err;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error("Error deleting value from Redis:", err);
      throw err;
    }
  }

  async close(): Promise<void> {
    try {
      await this.client.quit();
      console.log("Redis connection closed");
    } catch (err) {
      console.error("Error closing Redis connection:", err);
      throw err;
    }
  }
}

const redisClient = new RedisClient();

export const connection: RedisOptions = {
  host: config.redis.host || "localhost",
  port: Number(config.redis.port || 6379),
};

export default redisClient;
