-- Function to set user context for RLS policies
CREATE OR REPLACE FUNCTION set_user_context(profile_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set the current user's profile ID in the session
  PERFORM set_config('app.current_user_profile_id', profile_id::TEXT, false);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_user_context(INTEGER) TO authenticated; 