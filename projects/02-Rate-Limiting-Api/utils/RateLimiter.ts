import { NextFunction, Request, Response } from "express";
import { RedisClient } from "../config/redis.js";

interface IpDetails {
  tokens: number;
  lastRefillAt: number;
}

export class RateLimiter {
  constructor(
    private readonly redisClient: RedisClient,
    private readonly capacity: number,
    private readonly refillRate: number,
  ) {}

  private refillTokens(ipDetails: IpDetails): IpDetails {
    const now = Date.now();
    const elapsedTime = (now - ipDetails.lastRefillAt) / 1000;

    ipDetails.tokens = Math.min(
      this.capacity,
      ipDetails.tokens + elapsedTime * this.refillRate,
    );
    ipDetails.lastRefillAt = now;

    return ipDetails;
  }

  private async fetchIpDetails(ip: string): Promise<IpDetails | null> {
    const details = await this.redisClient.getData(ip);
    if (details) {
      return JSON.parse(details) as IpDetails;
    }
    return null;
  }

  private createNewIpDetails(): IpDetails {
    return {
      tokens: this.capacity,
      lastRefillAt: Date.now(),
    };
  }

  private getIpDetailsTtlSeconds(): number {
    return Math.ceil(this.capacity / this.refillRate);
  }

  private async saveIpDetails(ip: string, ipDetails: IpDetails): Promise<void> {
    await this.redisClient.setData(
      ip,
      JSON.stringify(ipDetails),
      this.getIpDetailsTtlSeconds(),
    );
  }

  private hasTokenExhausted(tokens: number): boolean {
    return tokens < 1;
  }

  public async rateLimiterCheck(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { ip } = req;

    if (!ip) {
      next();
      return;
    }

    const ipDetails =
      (await this.fetchIpDetails(ip)) ?? this.createNewIpDetails();
    const updatedIpDetails = this.refillTokens(ipDetails);

    if (this.hasTokenExhausted(updatedIpDetails.tokens)) {
      res.status(429).json({
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests. Try again in a few seconds.",
      });
      return;
    }

    updatedIpDetails.tokens -= 1;
    await this.saveIpDetails(ip, updatedIpDetails);

    next();
  }
}
