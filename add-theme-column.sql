-- Add theme column to profiles table
-- This is idempotent - safe to run multiple times

DO $$ 
BEGIN
    -- Add theme column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'theme'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN theme TEXT CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system';
        
        -- Add comment for documentation
        COMMENT ON COLUMN profiles.theme IS 'User theme preference: light, dark, or system';
    END IF;
END $$;
