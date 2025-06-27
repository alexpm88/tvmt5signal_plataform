-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing table and functions if they exist (for clean setup)
DROP TABLE IF EXISTS admin_users CASCADE;
DROP FUNCTION IF EXISTS authenticate_admin(TEXT, TEXT);
DROP FUNCTION IF EXISTS is_admin_user(TEXT);
DROP FUNCTION IF EXISTS update_admin_users_updated_at();

-- Create admin users table with password authentication
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_admin_users_updated_at();

-- Create function to authenticate admin user
CREATE OR REPLACE FUNCTION authenticate_admin(user_email TEXT, user_password TEXT)
RETURNS TABLE(user_id UUID, user_email TEXT, user_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT id, email, name
  FROM admin_users 
  WHERE email = user_email 
    AND password_hash = crypt(user_password, password_hash)
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = user_email AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Admin users can view own data" ON admin_users;
DROP POLICY IF EXISTS "System can manage admin users" ON admin_users;

-- Policy for reading own data
CREATE POLICY "Admin users can view own data" ON admin_users
  FOR SELECT USING (true); -- Allow reading for authenticated functions

-- Policy for system operations
CREATE POLICY "System can manage admin users" ON admin_users
  FOR ALL USING (false); -- Restrict direct access, use functions instead

-- Insert the default admin user
-- Email: twmt5signal@gmail.com
-- Password: admin123!
INSERT INTO admin_users (email, name, password_hash, is_active) VALUES
('twmt5signal@gmail.com', 'TVMT5 Admin', crypt('admin123!', gen_salt('bf')), true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = crypt('admin123!', gen_salt('bf')),
  name = 'TVMT5 Admin',
  is_active = true,
  updated_at = NOW();

-- Verify the setup
SELECT 
  'Admin user created successfully' as status,
  email, 
  name, 
  is_active, 
  created_at,
  CASE 
    WHEN password_hash IS NOT NULL THEN 'Password hash set'
    ELSE 'No password hash'
  END as password_status
FROM admin_users 
WHERE email = 'twmt5signal@gmail.com';

-- Test the authentication function
SELECT 
  'Authentication test' as test_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM authenticate_admin('twmt5signal@gmail.com', 'admin123!')
    ) THEN 'SUCCESS: Authentication works'
    ELSE 'FAILED: Authentication not working'
  END as result;

-- Test the admin check function
SELECT 
  'Admin check test' as test_type,
  CASE 
    WHEN is_admin_user('twmt5signal@gmail.com') THEN 'SUCCESS: Admin check works'
    ELSE 'FAILED: Admin check not working'
  END as result;
