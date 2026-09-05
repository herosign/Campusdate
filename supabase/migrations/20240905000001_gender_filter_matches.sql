-- Update calculate_matches RPC to enforce strict gender-based matching:
-- Male users only receive Female profile recommendations
-- Female users only receive Male profile recommendations
-- Other genders receive all available recommendations

CREATE OR REPLACE FUNCTION calculate_matches(current_user_id UUID) 
RETURNS TABLE (
    profile_id UUID,
    username TEXT,
    bio TEXT,
    photo_url TEXT,
    gender TEXT,
    match_score NUMERIC
) 
SECURITY DEFINER
AS $$
DECLARE
    curr_gender TEXT;
    target_gender TEXT;
BEGIN
    -- Look up current user's gender
    SELECT p.gender INTO curr_gender FROM public.profiles p WHERE p.id = current_user_id;

    IF curr_gender = 'Male' THEN
        target_gender := 'Female';
    ELSIF curr_gender = 'Female' THEN
        target_gender := 'Male';
    ELSE
        target_gender := NULL;
    END IF;

    RETURN QUERY
    WITH current_user_tags AS (
        SELECT pt.tag_id FROM public.profile_tags pt WHERE pt.profile_id = current_user_id
    ),
    potential_matches AS (
        SELECT p.id as p_id, p.username as p_username, p.bio as p_bio, p.photo_url as p_photo_url, p.gender as p_gender, p.smash_meter_score
        FROM public.profiles p
        WHERE p.id != current_user_id
        -- Filter for opposite gender
        AND (target_gender IS NULL OR p.gender = target_gender)
        -- Exclude already connected/matched users
        AND p.id NOT IN (
            SELECT m.user1_id FROM public.matches m WHERE m.user2_id = current_user_id
            UNION
            SELECT m.user2_id FROM public.matches m WHERE m.user1_id = current_user_id
        )
    ),
    tag_scores AS (
        SELECT pt.profile_id, COUNT(pt.tag_id) * 5 AS tag_score 
        FROM public.profile_tags pt
        JOIN current_user_tags cut ON pt.tag_id = cut.tag_id
        GROUP BY pt.profile_id
    )
    SELECT 
        pm.p_id, 
        pm.p_username, 
        pm.p_bio,
        pm.p_photo_url,
        pm.p_gender,
        (COALESCE(ts.tag_score, 0) * 0.5) + (pm.smash_meter_score * 2) AS match_score 
    FROM potential_matches pm
    LEFT JOIN tag_scores ts ON pm.p_id = ts.profile_id
    ORDER BY match_score DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;
