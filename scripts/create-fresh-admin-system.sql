-- Create a fresh admin system from scratch
-- This script assumes everything has been dropped first

-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify the extension is available
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
    ) THEN 'SUCCESS: pgcrypto extension is available'
    ELSE 'ERROR: pgcrypto extension not available'
  END as extension_status;

-- Create the admin_users table with all required columns
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

-- Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;

-- Create indexes for better performance
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- Create the updated_at trigger function
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_admin_users_updated_at();

-- Create the authentication function
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

-- Create the admin check function
CREATE OR REPLACE FUNCTION is_admin_user(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = user_email AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin users can view own data" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "System can manage admin users" ON admin_users
  FOR ALL USING (false);

-- Insert the default admin user with hashed password
INSERT INTO admin_users (email, name, password_hash, is_active) VALUES
('twmt5signal@gmail.com', 'TVMT5 Admin', crypt('admin123!', gen_salt('bf')), true);

-- Verify the admin user was created
SELECT 
  'Admin user verification' as check_type,
  id,
  email, 
  name, 
  is_active, 
  created_at,
  CASE 
    WHEN password_hash IS NOT NULL AND length(password_hash) > 10 THEN 'Password hash created successfully'
    ELSE 'Password hash missing or invalid'
  END as password_status
FROM admin_users 
WHERE email = 'twmt5signal@gmail.com';

-- Test the authentication function
SELECT 
  'Authentication test' as test_type,
  user_id,
  user_email,
  user_name
FROM authenticate_admin('twmt5signal@gmail.com', 'admin123!');

-- Test the admin check function
SELECT 
  'Admin check test' as test_type,
  is_admin_user('twmt5signal@gmail.com') as is_admin_result;

-- Final verification
SELECT 
  'System status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM admin_users WHERE email = 'twmt5signal@gmail.com')
    AND EXISTS (SELECT 1 FROM authenticate_admin('twmt5signal@gmail.com', 'admin123!'))
    AND is_admin_user('twmt5signal@gmail.com') = true
    THEN 'SUCCESS: Admin system is fully functional'
    ELSE 'ERROR: Admin system has issues'
  END as status;
