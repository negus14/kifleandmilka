-- Fix column types: text → numeric/integer for numeric columns
-- This migration converts existing string data to proper numeric types.

-- gift_contributions.amount: text → numeric(10,2)
-- The USING clause converts existing text values to numeric.
-- Any non-numeric text values will cause this migration to fail (which is intentional —
-- it means bad data snuck in and should be investigated).
ALTER TABLE "gift_contributions"
  ALTER COLUMN "amount" TYPE numeric(10,2) USING amount::numeric(10,2);

-- broadcasts.recipient_count: text → integer
ALTER TABLE "broadcasts"
  ALTER COLUMN "recipient_count" TYPE integer USING recipient_count::integer;
