-- Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create an RPC to fetch admin stats safely (since RLS might block normal queries)
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON
SECURITY DEFINER
AS $$
DECLARE
  total_users INT;
  total_males INT;
  total_females INT;
  total_matches INT;
  total_messages INT;
  result JSON;
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT count(*) INTO total_users FROM public.profiles;
  SELECT count(*) INTO total_males FROM public.profiles WHERE gender = 'Male';
  SELECT count(*) INTO total_females FROM public.profiles WHERE gender = 'Female';
  SELECT count(*) INTO total_matches FROM public.matches;
  SELECT count(*) INTO total_messages FROM public.messages;

  result := json_build_object(
    'total_users', total_users,
    'total_males', total_males,
    'total_females', total_females,
    'total_matches', total_matches,
    'total_messages', total_messages
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create an RPC to fetch all users and their tags (since RLS on profile_tags restricts it)
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  id UUID,
  username TEXT,
  gender TEXT,
  college TEXT,
  branch TEXT,
  year TEXT,
  email TEXT,
  tags JSON
)
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.gender,
    p.college,
    p.branch,
    p.year,
    p.email,
    COALESCE(
      (
        SELECT json_agg(json_build_object('id', t.id, 'label', t.tag_name, 'category', t.category))
        FROM public.profile_tags pt
        JOIN public.tags t ON t.id = pt.tag_id
        WHERE pt.profile_id = p.id
      ), 
      '[]'::json
    ) as tags
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;
