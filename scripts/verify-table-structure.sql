-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'signals' 
ORDER BY ordinal_position;

-- Check sample data
SELECT COUNT(*) as total_signals,
       COUNT(CASE WHEN processed = true THEN 1 END) as processed_signals,
       COUNT(CASE WHEN processed = true AND success = true THEN 1 END) as successful_signals,
       SUM(CASE WHEN pnl IS NOT NULL THEN pnl ELSE 0 END) as total_pnl
FROM signals;

-- Show recent signals
SELECT id, symbol, action, processed, success, pnl, timestamp
FROM signals 
ORDER BY timestamp DESC 
LIMIT 10;
