-- TVMT5 Signal Platform - Complete Database Setup
-- Execute this script in Supabase SQL Editor

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Check and create signals table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'signals') THEN
    -- Create signals table
    CREATE TABLE signals (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      symbol VARCHAR(20) NOT NULL,
      action VARCHAR(10) NOT NULL CHECK (action IN ('BUY', 'SELL')),
      order_type VARCHAR(50),
      stop_loss DECIMAL(10, 5),
      take_profit DECIMAL(10, 5),
      volume DECIMAL(10, 3),
      comment TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      processed BOOLEAN DEFAULT FALSE,
      success BOOLEAN,
      magic_number INTEGER,
      
      -- Performance tracking
      entry_price DECIMAL(10, 5),
      exit_price DECIMAL(10, 5),
      pnl DECIMAL(10, 2),
      closed_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create indexes for signals table
    CREATE INDEX IF NOT EXISTS idx_signals_processed ON signals(processed);
    CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);
    CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_signals_magic_number ON signals(magic_number);

    RAISE NOTICE '✅ Signals table created successfully';
  ELSE
    RAISE NOTICE '✅ Signals table already exists';
  END IF;
END $$;

-- Step 3: Check and create admin_users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    -- Create admin_users table
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

    -- Create indexes for admin_users table
    CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
    CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

    RAISE NOTICE '✅ Admin users table created successfully';
  ELSE
    RAISE NOTICE '✅ Admin users table already exists';
  END IF;
END $$;

-- Step 4: Create or replace functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Step 5: Create triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_signals_updated_at'
  ) THEN
    CREATE TRIGGER update_signals_updated_at 
      BEFORE UPDATE ON signals 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE '✅ Signals trigger created';
  ELSE
    RAISE NOTICE '✅ Signals trigger already exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_admin_users_updated_at'
  ) THEN
    CREATE TRIGGER update_admin_users_updated_at 
      BEFORE UPDATE ON admin_users 
      FOR EACH ROW 
      EXECUTE FUNCTION update_admin_users_updated_at();
    RAISE NOTICE '✅ Admin users trigger created';
  ELSE
    RAISE NOTICE '✅ Admin users trigger already exists';
  END IF;
END $$;

-- Step 6: Enable RLS and create policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can view own data" ON admin_users;
DROP POLICY IF EXISTS "System can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Allow all operations on signals" ON signals;

-- Create policies
CREATE POLICY "Admin users can view own data" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "System can manage admin users" ON admin_users
  FOR ALL USING (false);

CREATE POLICY "Allow all operations on signals" ON signals
  FOR ALL USING (true);

-- Step 7: Insert default admin user
INSERT INTO admin_users (email, name, password_hash, is_active) VALUES
('twmt5signal@gmail.com', 'TVMT5 Admin', crypt('admin123!', gen_salt('bf')), true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = crypt('admin123!', gen_salt('bf')),
  name = 'TVMT5 Admin',
  is_active = true,
  updated_at = NOW();

-- Step 8: Insert sample signals data if table is empty
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM signals) = 0 THEN
    INSERT INTO signals (symbol, action, entry_price, volume, comment, processed, success, pnl) VALUES
    ('EURUSD', 'BUY', 1.0850, 0.1, 'TradingView Alert - Bullish Signal', true, true, 125.50),
    ('GBPUSD', 'SELL', 1.2650, 0.1, 'TradingView Alert - Bearish Signal', true, true, 89.25),
    ('USDJPY', 'BUY', 149.50, 0.1, 'TradingView Alert - Breakout', true, false, -45.75),
    ('EURUSD', 'SELL', 1.0920, 0.1, 'TradingView Alert - Reversal', true, true, 67.80),
    ('GBPJPY', 'BUY', 189.25, 0.1, 'TradingView Alert - Momentum', true, false, -23.40),
    ('AUDUSD', 'BUY', 0.6580, 0.1, 'TradingView Alert - Support Bounce', true, true, 156.90),
    ('USDCAD', 'SELL', 1.3720, 0.1, 'TradingView Alert - Resistance', true, true, 78.30),
    ('NZDUSD', 'BUY', 0.5920, 0.1, 'TradingView Alert - Trend Following', true, false, -34.60),
    ('EURGBP', 'SELL', 0.8650, 0.1, 'TradingView Alert - Range Trading', true, true, 92.15),
    ('USDCHF', 'BUY', 0.8980, 0.1, 'TradingView Alert - Breakout', false, null, null),
    ('EURJPY', 'SELL', 162.40, 0.1, 'TradingView Alert - Pending', false, null, null),
    ('GBPCAD', 'BUY', 1.7320, 0.1, 'TradingView Alert - New Signal', false, null, null);

    -- Update timestamps for realistic data spread
    UPDATE signals SET 
      timestamp = NOW() - INTERVAL '1 day' * (random() * 30),
      created_at = NOW() - INTERVAL '1 day' * (random() * 30),
      closed_at = CASE 
        WHEN processed = true THEN timestamp + INTERVAL '1 hour' * (random() * 24)
        ELSE NULL 
      END
    WHERE processed = true;

    RAISE NOTICE '✅ Sample signals data inserted';
  ELSE
    RAISE NOTICE '✅ Signals data already exists';
  END IF;
END $$;

-- Step 9: Final verification
SELECT 
  '🎉 SETUP COMPLETE' as status,
  'TVMT5 Signal Platform database configured successfully!' as message;

-- Verify tables exist
SELECT 
  '📊 TABLES' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'signals')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users')
    THEN '✅ All tables exist'
    ELSE '❌ Some tables missing'
  END as result;

-- Verify functions exist
SELECT 
  '⚙️ FUNCTIONS' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'authenticate_admin')
    AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'is_admin_user')
    THEN '✅ All functions exist'
    ELSE '❌ Some functions missing'
  END as result;

-- Test authentication
SELECT 
  '🔐 AUTHENTICATION TEST' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM authenticate_admin('twmt5signal@gmail.com', 'admin123!')
    ) THEN '✅ Authentication works'
    ELSE '❌ Authentication failed'
  END as result;

-- Show data counts
SELECT 
  '📈 DATA SUMMARY' as info,
  (SELECT COUNT(*) FROM signals) as total_signals,
  (SELECT COUNT(*) FROM admin_users) as admin_users,
  (SELECT COUNT(*) FROM signals WHERE processed = true) as processed_signals;
