-- Comprehensive schema fix for Focusly database
-- This script checks and fixes all potential schema mismatches

-- 1. Fix reflections table
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

-- 2. Check if profiles table has timezone column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'timezone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN timezone TEXT DEFAULT 'UTC' NOT NULL;
        RAISE NOTICE 'Added timezone column to profiles table';
    ELSE
        RAISE NOTICE 'timezone column already exists in profiles table';
    END IF;
END $$;

-- 3. Check if long_term_goals table has target_years column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'long_term_goals' 
        AND column_name = 'target_years'
    ) THEN
        ALTER TABLE long_term_goals ADD COLUMN target_years INTEGER DEFAULT 3 NOT NULL;
        RAISE NOTICE 'Added target_years column to long_term_goals table';
    ELSE
        RAISE NOTICE 'target_years column already exists in long_term_goals table';
    END IF;
END $$;

-- 4. Verify all table structures
SELECT 'profiles' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position

UNION ALL

SELECT 'long_term_goals' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'long_term_goals' 
ORDER BY ordinal_position

UNION ALL

SELECT 'focus_areas' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'focus_areas' 
ORDER BY ordinal_position

UNION ALL

SELECT 'monthly_goals' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'monthly_goals' 
ORDER BY ordinal_position

UNION ALL

SELECT 'todos' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'todos' 
ORDER BY ordinal_position

UNION ALL

SELECT 'notes' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notes' 
ORDER BY ordinal_position

UNION ALL

SELECT 'reflections' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reflections' 
ORDER BY ordinal_position;
