-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert admin user with hashed password
-- Default password: "admin123!" (change this after first login)
INSERT INTO admin_users (email, name, password_hash, is_active) VALUES
('twmt5signal@gmail.com', 'TVMT5 Admin', crypt('admin123!', gen_salt('bf')), true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = crypt('admin123!', gen_salt('bf')),
  name = 'TVMT5 Admin',
  is_active = true,
  updated_at = NOW();

-- Verify the user was created
SELECT email, name, is_active, created_at FROM admin_users WHERE email = 'twmt5signal@gmail.com';
