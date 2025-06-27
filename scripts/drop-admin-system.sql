-- Drop everything related to admin_users to start fresh
-- This script will clean up any existing admin system

-- Drop triggers first
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;

-- Drop functions
DROP FUNCTION IF EXISTS authenticate_admin(TEXT, TEXT);
DROP FUNCTION IF EXISTS is_admin_user(TEXT);
DROP FUNCTION IF EXISTS update_admin_users_updated_at();

-- Drop policies
DROP POLICY IF EXISTS "Admin users can view own data" ON admin_users;
DROP POLICY IF EXISTS "System can manage admin users" ON admin_users;

-- Disable RLS
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;

-- Drop indexes
DROP INDEX IF EXISTS idx_admin_users_email;
DROP INDEX IF EXISTS idx_admin_users_active;

-- Drop the table completely
DROP TABLE IF EXISTS admin_users CASCADE;

-- Verify everything is dropped
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'admin_users'
    ) THEN 'SUCCESS: admin_users table dropped'
    ELSE 'WARNING: admin_users table still exists'
  END as table_status;

SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name IN ('authenticate_admin', 'is_admin_user', 'update_admin_users_updated_at')
    ) THEN 'SUCCESS: All functions dropped'
    ELSE 'WARNING: Some functions still exist'
  END as functions_status;
