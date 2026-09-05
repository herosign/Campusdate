-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    bio TEXT,
    movie TEXT,
    quote TEXT,
    music TEXT,
    hobbies TEXT[], -- Max 5
    photo_url TEXT,
    smash_meter_score NUMERIC DEFAULT -1, -- Bounded between -15 and +15
    instagram_handle TEXT,
    gender TEXT,
    college TEXT,
    branch TEXT,
    year TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Tags Table (The Hidden Tagging System)
CREATE TABLE public.tags (
    id SERIAL PRIMARY KEY,
    tag_name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL
);

-- Insert initial tags
INSERT INTO public.tags (tag_name, category) VALUES
('tag_intent_serious_ltr', 'Intent'), ('tag_intent_casual_dating', 'Intent'), ('tag_intent_figuring_it_out', 'Intent'), ('tag_intent_fest_season_partner', 'Intent'), ('tag_intent_study_partner_to_lovers', 'Intent'), ('tag_intent_strictly_monogamous', 'Intent'), ('tag_intent_short_term_fun', 'Intent'), ('tag_intent_manhater', 'Intent'), ('tag_timeline_fast_mover', 'Intent'), ('tag_timeline_slow_burn', 'Intent'),
('tag_persona_golden_retriever', 'Persona'), ('tag_persona_black_cat', 'Persona'), ('tag_persona_hopeless_romantic', 'Persona'), ('tag_persona_pragmatic_realist', 'Persona'), ('tag_persona_laid_back_chill', 'Persona'), ('tag_persona_high_maintenance', 'Persona'), ('tag_persona_campus_socialite', 'Persona'), ('tag_persona_introverted_nerd', 'Persona'), ('tag_dynamic_planner', 'Persona'), ('tag_dynamic_passenger', 'Persona'),
('tag_love_lang_quality_time', 'Love Languages'), ('tag_love_lang_physical_touch', 'Love Languages'), ('tag_love_lang_words_affirmation', 'Love Languages'), ('tag_love_lang_acts_service', 'Love Languages'), ('tag_love_lang_gift_giving', 'Love Languages'), ('tag_pda_highly_comfortable', 'Love Languages'), ('tag_pda_strictly_private', 'Love Languages'),
('tag_date_vibe_library_grind', 'Date Vibes'), ('tag_date_vibe_hims_cafes', 'Date Vibes'), ('tag_date_vibe_street_food_walks', 'Date Vibes'), ('tag_date_vibe_late_night_drives', 'Date Vibes'), ('tag_date_vibe_gaming_duo', 'Date Vibes'), ('tag_date_vibe_movie_binging', 'Date Vibes'), ('tag_date_vibe_metro_romance', 'Date Vibes'), ('tag_date_vibe_budget_friendly', 'Date Vibes'), ('tag_date_vibe_expensive_taste', 'Date Vibes'),
('tag_comm_rapid_texter', 'Communication'), ('tag_comm_late_replier', 'Communication'), ('tag_comm_calls_over_texts', 'Communication'), ('tag_comm_facetime_regular', 'Communication'), ('tag_comm_meme_love_language', 'Communication'), ('tag_comm_2am_deep_talks', 'Communication'), ('tag_comm_direct_blunt', 'Communication'), ('tag_comm_subtle_hints', 'Communication'), ('tag_comm_hates_small_talk', 'Communication'), ('tag_humor_flirty_banter', 'Communication'), ('tag_humor_wholesome_sweet', 'Communication'), ('tag_conflict_talk_it_out_now', 'Communication'), ('tag_conflict_needs_space', 'Communication'), ('tag_conflict_apologizes_first', 'Communication'), ('tag_emotionally_expressive', 'Communication'), ('tag_emotionally_guarded', 'Communication'), ('tag_quirk_overthinker', 'Communication'), ('tag_quirk_go_with_the_flow', 'Communication'), ('tag_attachment_secure', 'Communication'), ('tag_jealousy_protective', 'Communication'), ('tag_jealousy_open_secure', 'Communication'),
('tag_rhythm_early_bird', 'Rhythm & Dealbreakers'), ('tag_rhythm_night_owl', 'Rhythm & Dealbreakers'), ('tag_rhythm_strict_curfew', 'Rhythm & Dealbreakers'), ('tag_rhythm_hostel_freedom', 'Rhythm & Dealbreakers'), ('tag_rhythm_weekend_homebody', 'Rhythm & Dealbreakers'), ('tag_rhythm_weekend_adventurer', 'Rhythm & Dealbreakers'), ('tag_finance_splits_bills_equally', 'Rhythm & Dealbreakers'), ('tag_finance_traditional_payer', 'Rhythm & Dealbreakers'), ('tag_value_career_first', 'Rhythm & Dealbreakers'), ('tag_value_relationship_first', 'Rhythm & Dealbreakers'), ('tag_value_smoker', 'Rhythm & Dealbreakers'), ('tag_value_non_smoker_strict', 'Rhythm & Dealbreakers'), ('tag_value_drinker_partygoer', 'Rhythm & Dealbreakers'), ('tag_value_teetotaler', 'Rhythm & Dealbreakers'), ('tag_value_wants_same_college', 'Rhythm & Dealbreakers'), ('tag_value_wants_different_college', 'Rhythm & Dealbreakers'), ('tag_value_gossip_lover', 'Rhythm & Dealbreakers'), ('tag_value_drama_free', 'Rhythm & Dealbreakers');

-- 3. Profile Tags Mapping
CREATE TABLE public.profile_tags (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tag_id INT REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, tag_id)
);

-- Profile Tags RLS
ALTER TABLE public.profile_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile tags are hidden from public, only server/RPC can read them." ON public.profile_tags FOR SELECT USING (false);
CREATE POLICY "Users can insert their own profile tags" ON public.profile_tags FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can delete their own profile tags" ON public.profile_tags FOR DELETE USING (auth.uid() = profile_id);
-- (Using SECURITY DEFINER functions for matching so users don't need direct select access)

-- Tags RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);

-- 4. Referrals
CREATE TABLE public.referrals (
    id SERIAL PRIMARY KEY,
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referred_id)
);

-- Referrals RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can insert referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- 5. Ratings
CREATE TABLE public.ratings (
    id SERIAL PRIMARY KEY,
    rater_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rated_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    moon_type TEXT CHECK (moon_type IN ('FULL', 'HALF', 'QUARTER')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rater_id, rated_id)
);

-- Ratings RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own ratings" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);
CREATE POLICY "Users can update their own ratings" ON public.ratings FOR UPDATE USING (auth.uid() = rater_id);
CREATE POLICY "Users can view ratings" ON public.ratings FOR SELECT USING (true);

-- 6. Matches
CREATE TABLE public.matches (
    id SERIAL PRIMARY KEY,
    user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user1_reveal_consent BOOLEAN DEFAULT FALSE,
    user2_reveal_consent BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'ACTIVE',
    terminated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    message_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user1_id, user2_id)
);

-- Matches RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own matches" ON public.matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can insert their own matches" ON public.matches FOR INSERT WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "Users can update their own matches (for consent)" ON public.matches FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 7. Messages
CREATE TABLE public.messages (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES public.matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their matches" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid()))
);
CREATE POLICY "Users can insert messages in their matches" ON public.messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid()))
);

-- 8. Functions & Triggers

-- Trigger to increment message count on a match
CREATE OR REPLACE FUNCTION increment_message_count() RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.matches
    SET message_count = message_count + 1
    WHERE id = NEW.match_id;

    -- Prevent insert if message count exceeds 50
    IF (SELECT message_count FROM public.matches WHERE id = NEW.match_id) > 50 THEN
        RAISE EXCEPTION 'Message limit of 50 reached for this match.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_insert
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION increment_message_count();

-- Trigger to calculate smash meter
CREATE OR REPLACE FUNCTION recalculate_smash_meter() RETURNS TRIGGER AS $$
DECLARE
    new_score NUMERIC;
    base_score NUMERIC := -1;
    referrals_count NUMERIC;
    ratings_sum NUMERIC;
    target_user UUID;
BEGIN
    IF TG_TABLE_NAME = 'referrals' THEN
        target_user := NEW.referrer_id;
    ELSIF TG_TABLE_NAME = 'ratings' THEN
        target_user := NEW.rated_id;
    END IF;

    SELECT COUNT(*) INTO referrals_count FROM public.referrals WHERE referrer_id = target_user;
    
    SELECT COALESCE(SUM(
        CASE 
            WHEN moon_type = 'FULL' THEN 3
            WHEN moon_type = 'HALF' THEN 1.5
            WHEN moon_type = 'QUARTER' THEN 0.5
            ELSE 0
        END
    ), 0) INTO ratings_sum FROM public.ratings WHERE rated_id = target_user;

    new_score := base_score + referrals_count + ratings_sum;

    -- Clamp between -15 and +15
    IF new_score > 15 THEN
        new_score := 15;
    ELSIF new_score < -15 THEN
        new_score := -15;
    END IF;

    UPDATE public.profiles SET smash_meter_score = new_score WHERE id = target_user;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_referral_insert
AFTER INSERT OR UPDATE OR DELETE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION recalculate_smash_meter();

CREATE TRIGGER on_rating_insert
AFTER INSERT OR UPDATE OR DELETE ON public.ratings
FOR EACH ROW EXECUTE FUNCTION recalculate_smash_meter();

-- 9. Matching Algorithm RPC (Security Definer to bypass RLS on tags)
CREATE OR REPLACE FUNCTION calculate_matches(current_user_id UUID) 
RETURNS TABLE (
    profile_id UUID,
    username TEXT,
    bio TEXT,
    photo_url TEXT,
    match_score NUMERIC
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH current_user_tags AS (
        SELECT pt.tag_id FROM public.profile_tags pt WHERE pt.profile_id = current_user_id
    ),
    potential_matches AS (
        SELECT p.id as p_id, p.username as p_username, p.bio as p_bio, p.photo_url as p_photo_url, p.smash_meter_score
        FROM public.profiles p
        WHERE p.id != current_user_id
        -- Exclude already matched users
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
        (COALESCE(ts.tag_score, 0) * 0.5) + (pm.smash_meter_score * 2) AS match_score 
    FROM potential_matches pm
    LEFT JOIN tag_scores ts ON pm.p_id = ts.profile_id
    ORDER BY match_score DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;
