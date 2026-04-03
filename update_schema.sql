-- Setup Barbers Table
CREATE TABLE barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  specialty TEXT NOT NULL,
  experience TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for barbers
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- Anyone can view barbers
CREATE POLICY "Anyone can view barbers" ON barbers FOR SELECT USING (true);

-- Only admins can manage barbers
CREATE POLICY "Admins can insert barbers" ON barbers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update barbers" ON barbers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete barbers" ON barbers FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);


-- Setup Services Table
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  duration TEXT NOT NULL,
  category TEXT DEFAULT 'Haircut',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Anyone can view services
CREATE POLICY "Anyone can view services" ON services FOR SELECT USING (true);

-- Only admins can manage services
CREATE POLICY "Admins can insert services" ON services FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update services" ON services FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete services" ON services FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- OPTIONAL: Insert Default Mock Data so your booking page doesn't look empty immediately 
INSERT INTO barbers (name, image, specialty, experience, rating) VALUES 
('Miguel Santos', '/barbers/miguel.png', 'Fades & Undercuts', '8 years', 4.9),
('James Cruz', '/barbers/james.png', 'Pompadour & Classic Styles', '10 years', 4.8),
('Carlo Reyes', '/barbers/carlo.png', 'Razor Fades & Beard Design', '6 years', 4.9);

INSERT INTO services (name, price, duration, category) VALUES 
('Classic Fade', '₱350', '45 min', 'Haircuts'),
('Signature Undercut', '₱400', '50 min', 'Haircuts'),
('Hot Towel Shave', '₱300', '40 min', 'Grooming');
