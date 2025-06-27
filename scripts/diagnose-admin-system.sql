-- Diagnostic script to check current state of admin system

-- Check if admin_users table exists and its structure
SELECT 
  'Table existence' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'admin_users'
    ) THEN 'admin_users table exists'
    ELSE 'admin_users table does not exist'
  END as result;

-- Check table columns if table exists
SELECT 
  'Table structure' as check_type,
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;

-- Check if pgcrypto extension is available
SELECT 
  'Extension check' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
    ) THEN 'pgcrypto extension is available'
    ELSE 'pgcrypto extension is NOT available'
  END as result;

-- Check if functions exist
SELECT 
  'Functions check' as check_type,
  routine_name,
  routine_type,
  'exists' as status
FROM information_schema.routines 
WHERE routine_name IN ('authenticate_admin', 'is_admin_user', 'update_admin_users_updated_at')
ORDER BY routine_name;

-- Check if triggers exist
SELECT 
  'Triggers check' as check_type,
  trigger_name,
  event_manipulation,
  event_object_table,
  'exists' as status
FROM information_schema.triggers 
WHERE event_object_table = 'admin_users';

-- Check if there are any admin users (if table exists)
SELECT 
  'Data check' as check_type,
  COUNT(*) as admin_user_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'Admin users exist'
    ELSE 'No admin users found'
  END as result
FROM admin_users
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'admin_users'
);

-- Check RLS status (if table exists)
SELECT 
  'RLS check' as check_type,
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS is enabled'
    ELSE 'RLS is disabled'
  END as result
FROM pg_tables 
WHERE tablename = 'admin_users';
