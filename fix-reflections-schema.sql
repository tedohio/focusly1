-- Fix reflections table schema
-- Add improvements column if it doesn't exist

-- Check if improvements column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reflections' 
        AND column_name = 'improvements'
    ) THEN
        ALTER TABLE reflections ADD COLUMN improvements TEXT;
        RAISE NOTICE 'Added improvements column to reflections table';
    ELSE
        RAISE NOTICE 'improvements column already exists in reflections table';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reflections' 
ORDER BY ordinal_position;
