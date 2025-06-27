-- Script to change admin password
-- Replace 'NEW_PASSWORD_HERE' with your desired password

-- Update password for the admin user
UPDATE admin_users 
SET 
  password_hash = crypt('NEW_PASSWORD_HERE', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'twmt5signal@gmail.com';

-- Verify the password change
SELECT 
  'Password change verification' as test_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM authenticate_admin('twmt5signal@gmail.com', 'NEW_PASSWORD_HERE')
    ) THEN 'SUCCESS: New password works'
    ELSE 'FAILED: New password not working'
  END as result;

-- Test that old password no longer works
SELECT 
  'Old password test' as test_type,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM authenticate_admin('twmt5signal@gmail.com', 'admin123!')
    ) THEN 'SUCCESS: Old password disabled'
    ELSE 'WARNING: Old password still works'
  END as result;
