-- Run this in the Supabase SQL Editor to prevent double-bookings

-- This enforces that a specific barber cannot have two bookings at the exactly same date and time.
-- Note: You might need to ensure you don't have overlapping bookings in your table first!
-- If you do, you'll need to resolve those before this constraint can be successfully added.

ALTER TABLE bookings 
ADD CONSTRAINT unique_barber_slot UNIQUE (barber_id, booking_date, booking_time);
