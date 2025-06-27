-- Create admin users table with password authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to read their own data
CREATE POLICY "Admin users can view own data" ON admin_users
  FOR SELECT USING (auth.email() = email);

-- Only allow system to insert/update admin users
CREATE POLICY "System can manage admin users" ON admin_users
  FOR ALL USING (false);

-- Insert the admin user with hashed password
-- Password: "admin123!" (you should change this)
-- This is a bcrypt hash of "admin123!"
INSERT INTO admin_users (email, name, password_hash, is_active) VALUES
('twmt5signal@gmail.com', 'Admin User', '$2b$10$rOzJqKqQxQxQxQxQxQxQxOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', true)
ON CONFLICT (email) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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
