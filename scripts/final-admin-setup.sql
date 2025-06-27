-- Complete setup script for admin system
-- Execute this in Supabase SQL Editor

-- Step 1: Enable required extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Drop existing admin system if it exists
DO $$ 
BEGIN
  -- Drop triggers
  DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
  
  -- Drop functions
  DROP FUNCTION IF EXISTS authenticate_admin(TEXT, TEXT);
  DROP FUNCTION IF EXISTS is_admin_user(TEXT);
  DROP FUNCTION IF EXISTS update_admin_users_updated_at();
  
  -- Drop policies
  DROP POLICY IF EXISTS "Admin users can view own data" ON admin_users;
  DROP POLICY IF EXISTS "System can manage admin users" ON admin_users;
  
  -- Disable RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Drop indexes
  DROP INDEX IF EXISTS idx_admin_users_email;
  DROP INDEX IF EXISTS idx_admin_users_active;
  
  -- Drop the table
  DROP TABLE IF EXISTS admin_users CASCADE;
  
  RAISE NOTICE 'Cleanup completed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Cleanup completed with some warnings: %', SQLERRM;
END $$;

-- Step 3: Create the admin_users table
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

-- Step 4: Create indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- Step 5: Create functions
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_admin_users_updated_at();

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

CREATE OR REPLACE FUNCTION is_admin_user(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = user_email AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Enable RLS and create policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view own data" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "System can manage admin users" ON admin_users
  FOR ALL USING (false);

-- Step 7: Insert default admin user
INSERT INTO admin_users (email, name, password_hash, is_active) VALUES
('twmt5signal@gmail.com', 'TVMT5 Admin', crypt('admin123!', gen_salt('bf')), true);

-- Step 8: Verification
SELECT 
  'SETUP COMPLETE' as status,
  'Admin system has been created successfully' as message;

SELECT 
  'ADMIN USER' as info,
  email, 
  name, 
  is_active, 
  created_at
FROM admin_users 
WHERE email = 'twmt5signal@gmail.com';

SELECT 
  'AUTHENTICATION TEST' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM authenticate_admin('twmt5signal@gmail.com', 'admin123!')
    ) THEN 'SUCCESS: Authentication works'
    ELSE 'FAILED: Authentication not working'
  END as result;

SELECT 
  'ADMIN CHECK TEST' as test,
  CASE 
    WHEN is_admin_user('twmt5signal@gmail.com') THEN 'SUCCESS: Admin check works'
    ELSE 'FAILED: Admin check not working'
  END as result;
