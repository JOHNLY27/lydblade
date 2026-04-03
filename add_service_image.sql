-- Add image_url column to services table for haircut images
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;
