-- Drop table if exists to recreate with correct structure
DROP TABLE IF EXISTS signals;

-- Create signals table in Supabase with correct column names
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_signals_processed ON signals(processed);
CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);
CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_signals_magic_number ON signals(magic_number);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_signals_updated_at 
    BEFORE UPDATE ON signals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
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
