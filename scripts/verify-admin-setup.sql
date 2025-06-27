-- Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;

-- Check if admin user exists
SELECT 
  id,
  email, 
  name, 
  is_active, 
  created_at,
  updated_at,
  CASE 
    WHEN password_hash IS NOT NULL THEN 'Password hash exists'
    ELSE 'No password hash'
  END as password_status
FROM admin_users 
WHERE email = 'twmt5signal@gmail.com';

-- Test authentication function
SELECT 
  user_id,
  user_email,
  user_name
FROM authenticate_admin('twmt5signal@gmail.com', 'admin123!');

-- Test admin check function
SELECT is_admin_user('twmt5signal@gmail.com') as is_admin;

-- Check if functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN ('authenticate_admin', 'is_admin_user', 'update_admin_users_updated_at')
ORDER BY routine_name;

-- Check if triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'admin_users';
