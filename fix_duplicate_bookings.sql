-- This query removes any existing duplicate bookings for the same barber, date, and time.
-- It keeps the oldest booking (the one made first) and deletes the extra ones.

DELETE FROM bookings
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY barber_id, booking_date, booking_time
      ORDER BY created_at ASC
    ) as row_num
    FROM bookings
  ) t
  WHERE t.row_num > 1
);

-- After running the above query, you can now safely apply the unique constraint:
ALTER TABLE bookings 
ADD CONSTRAINT unique_barber_slot UNIQUE (barber_id, booking_date, booking_time);
