-- Add barber_id column to existing bookings table
-- Run this in your Supabase SQL Editor

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS barber_id TEXT;
