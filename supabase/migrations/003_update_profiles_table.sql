-- Update profiles table to ensure lastSignIn and streak fields exist with proper defaults

-- Add lastSignIn column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'lastSignIn') THEN
        ALTER TABLE profiles ADD COLUMN "lastSignIn" TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add streak column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'streak') THEN
        ALTER TABLE profiles ADD COLUMN streak INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update existing profiles to have default values
UPDATE profiles 
SET 
    "lastSignIn" = COALESCE("lastSignIn", created_at),
    streak = COALESCE(streak, 0)
WHERE "lastSignIn" IS NULL OR streak IS NULL;

-- Set NOT NULL constraints after ensuring all rows have values
ALTER TABLE profiles ALTER COLUMN "lastSignIn" SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN streak SET NOT NULL;

-- Add index for better performance on streak queries
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON profiles(streak DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in ON profiles("lastSignIn" DESC); 