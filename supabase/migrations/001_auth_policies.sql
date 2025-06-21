-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current user's profile ID
CREATE OR REPLACE FUNCTION get_current_user_profile_id()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function will be called by the backend with the user's profile ID
  -- The backend will set this via SET LOCAL
  RETURN current_setting('app.current_user_profile_id', true)::INTEGER;
END;
$$;

-- Profiles table policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (id = get_current_user_profile_id());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = get_current_user_profile_id());

-- User games table policies
CREATE POLICY "Users can view their own game results" ON user_games
  FOR SELECT USING (userID = get_current_user_profile_id());

CREATE POLICY "Users can insert their own game results" ON user_games
  FOR INSERT WITH CHECK (userID = get_current_user_profile_id());

CREATE POLICY "Users can update their own game results" ON user_games
  FOR UPDATE USING (userID = get_current_user_profile_id());

-- User badges table policies
CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (userID = get_current_user_profile_id());

CREATE POLICY "Users can insert their own badges" ON user_badges
  FOR INSERT WITH CHECK (userID = get_current_user_profile_id());

CREATE POLICY "Users can update their own badges" ON user_badges
  FOR UPDATE USING (userID = get_current_user_profile_id());

-- Games table policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view games" ON games
  FOR SELECT USING (true);

-- Questions table policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view questions" ON questions
  FOR SELECT USING (true);

-- Badges table policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view badges" ON badges
  FOR SELECT USING (true);

-- Categories table policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view categories" ON categories
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_fid ON profiles(fid);
CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(userID);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(userID);
CREATE INDEX IF NOT EXISTS idx_user_games_created_at ON user_games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_created_at ON user_badges(created_at DESC); 