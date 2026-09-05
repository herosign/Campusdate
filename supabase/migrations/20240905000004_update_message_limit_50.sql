-- Update message limit from 20 to 50 per match
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
