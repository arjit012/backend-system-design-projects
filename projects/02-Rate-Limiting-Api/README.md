# Rate Limiting API

This project is a small Node.js + Express proof of concept for IP-based rate limiting backed by Redis.

It uses:

- `app.ts` for app wiring and middleware registration
- `server.ts` for server startup and shutdown
- `config/redis.ts` for Redis connection management
- `utils/RateLimiter.ts` for token-bucket rate limiting
- `testScript.cjs` to generate repeated requests and verify the limiter

## Prerequisites

- Node.js 18+
- npm
- Redis running locally on `redis://localhost:6379` or another Redis instance reachable through `REDIS_URL`

## Project Setup

```bash
cd /Users/unthinkable-lap/Desktop/System\ Design/backend-system-design-projects/projects/02-Rate-Limiting-Api
npm install
```

## Environment Variables

Create or update `.env` in the project root:

```env
PORT=3000
REDIS_URL=redis://localhost:6379
RATE_LIMIT_CAPACITY=10
RATE_LIMIT_REFILL_RATE=2
```

Notes:

- `RATE_LIMIT_CAPACITY` is the maximum number of tokens in the bucket.
- `RATE_LIMIT_REFILL_RATE` is the number of tokens added per second.
- Avoid spaces around `=` in `.env` values.
- You can play around with these values to see how the limiter behaves under different traffic patterns.

Examples:

- `RATE_LIMIT_CAPACITY=5` and `RATE_LIMIT_REFILL_RATE=1` allows short bursts of 5 requests and then refills 1 token per second.
- `RATE_LIMIT_CAPACITY=20` and `RATE_LIMIT_REFILL_RATE=5` is more forgiving and recovers faster after a burst.
- `RATE_LIMIT_CAPACITY=2` and `RATE_LIMIT_REFILL_RATE=1` makes throttling easy to observe while testing locally.

## Start Redis

If you have Redis installed locally, start it before running the app.

Example:

```bash
redis-server
```

If Redis is already running elsewhere, set `REDIS_URL` in `.env` accordingly.

## Run The App

For development:

```bash
npm run dev
```

For a one-time start:

```bash
npm start
```

The app starts on:

```bash
http://localhost:3000
```

## Available Endpoint

Health check:

```bash
GET /health
```

Example:

```bash
curl http://localhost:3000/health
```

## Algorithm Used

This project uses the `token bucket` algorithm.

How it works:

- Every IP address gets its own bucket.
- The bucket starts with `RATE_LIMIT_CAPACITY` tokens.
- Each incoming request consumes 1 token.
- Tokens are added back over time based on `RATE_LIMIT_REFILL_RATE`.
- If the bucket has fewer than 1 token, the request is rejected with `429 Too Many Requests`.

Example:

- `RATE_LIMIT_CAPACITY=5`
- `RATE_LIMIT_REFILL_RATE=2`

Imagine a client sends requests quickly:

1. The bucket starts with 5 tokens.
2. The first 5 requests are allowed because each one consumes 1 token.
3. The 6th request is rejected because the bucket is empty.
4. After 1 second, 2 tokens are added back.
5. Now 2 more requests can be allowed before the bucket is empty again.

Why this is useful:

- It allows small bursts of traffic.
- It prevents unlimited request spam.
- It is smoother than a strict fixed-window approach because tokens refill continuously over time.

## Test The Rate Limiter

This project includes `testScript.cjs`, which sends repeated requests to:

```bash
http://localhost:3000/health
```

Run it in a separate terminal after the server is up:

```bash
node testScript.cjs
```

What to expect:

- At first, requests should be allowed.
- Once the token bucket is exhausted, the script should start receiving `429 Too Many Requests`.
- After refill happens, requests should be allowed again.
- Try changing `RATE_LIMIT_CAPACITY` and `RATE_LIMIT_REFILL_RATE` in `.env`, restart the app, and run `node testScript.cjs` again to observe different rate-limiting behavior.

## Troubleshooting

- If the app fails at startup, make sure Redis is running and `REDIS_URL` is correct.
- If the limiter does not behave as expected, verify the values in `.env`.
- If `testScript.cjs` cannot connect, confirm the app is running on the same `PORT` used in the script.
