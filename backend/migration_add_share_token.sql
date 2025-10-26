-- Migration: Add share_token to expense_groups table
-- Date: 2025-10-26

-- Add share_token column to expense_groups
ALTER TABLE expense_groups
ADD COLUMN share_token VARCHAR UNIQUE;

-- Create index on share_token for faster lookups
CREATE INDEX idx_expense_groups_share_token ON expense_groups(share_token);

-- Generate share_token for existing groups (if any)
-- This will generate a random token for each existing group
UPDATE expense_groups
SET share_token = encode(gen_random_bytes(24), 'base64')
WHERE share_token IS NULL;

-- Make share_token NOT NULL after populating existing rows
ALTER TABLE expense_groups
ALTER COLUMN share_token SET NOT NULL;
