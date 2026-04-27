import { createClient, type RedisClientType } from "redis";

export class RedisClient {
  private redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
  }

  public getClient(): RedisClientType {
    return this.redisClient;
  }

  public async setData(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<void> {
    if (ttlSeconds && ttlSeconds > 0) {
      await this.redisClient.set(key, value, {
        expiration: { type: "EX", value: ttlSeconds },
      });
      return;
    }

    await this.redisClient.set(key, value);
  }

  public async getData(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  public async connect(): Promise<void> {
    const client = this.getClient();

    if (client.isOpen) return;

    await client.connect();
  }

  public async disconnect(): Promise<void> {
    if (!this.redisClient?.isOpen) return;

    await this.redisClient.quit();
  }
}
