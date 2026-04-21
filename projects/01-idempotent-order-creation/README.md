# Idempotent Order Creation

This project is a small backend POC that demonstrates idempotent order creation.

The main idea is to prevent duplicate orders when the same client request is retried. The API expects an `Idempotency-Key` header for order creation requests. When a request comes in:

- if the key is new, the service creates the order and stores the response against that key
- if the same key is sent again with the same request body, the service returns the previously stored response
- if the same key is sent again with a different request body, the service returns a `409 Conflict`

This is useful in real systems where clients may retry requests because of timeouts, network failures, or uncertain responses.

The current implementation focuses on the core idempotency problem statement. Some production details are intentionally lightweight, such as exhaustive validation, tests, and broader edge-case handling.

## Tech Stack

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL

## Local Setup

1. Move into the project directory.

```bash
cd /backend-system-design-projects/projects/01-idempotent-order-creation
```

2. Install dependencies.

```bash
npm install
```

3. Make sure PostgreSQL is running locally and create a database.

4. Set the database connection string in `.env`.

```env
DATABASE_URL="postgresql://postgres@localhost:5432/idempotent_orders?schema=public"
```

5. Run Prisma migrations.

```bash
npx prisma migrate dev
```

6. Generate the Prisma client.

```bash
npx prisma generate
```

7. Start the project.

```bash
npm run dev
```

For a one-time run instead of watch mode:

```bash
npm run start
```

## Example Behavior

Send a `POST` request to the orders endpoint with an `Idempotency-Key` header and a JSON body:

```json
{
  "products": ["iphone", "airpods"]
}
```

Expected behavior:

- first request with a new key creates an order
- retry with the same key and same body returns the saved response
- retry with the same key and a different body returns `409 Conflict`
