INSERT INTO "order_statuses" ("id", "code", "description", "updated_at")
VALUES
  (1, 'PENDING', 'Order has been received and is waiting to be processed.', CURRENT_TIMESTAMP),
  (2, 'PROCESSING', 'Order is currently being processed.', CURRENT_TIMESTAMP),
  (3, 'COMPLETED', 'Order has been completed successfully.', CURRENT_TIMESTAMP),
  (4, 'CANCELLED', 'Order was cancelled before completion.', CURRENT_TIMESTAMP),
  (5, 'FAILED', 'Order could not be completed because of an error.', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "updated_at" = CURRENT_TIMESTAMP;
