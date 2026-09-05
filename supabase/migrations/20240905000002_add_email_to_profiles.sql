-- Migration to add email column to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create an index to quickly look up users by email if needed
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Backfill existing profiles with their email from auth.users
UPDATE public.profiles p
SET email = (SELECT u.email FROM auth.users u WHERE u.id = p.id)
WHERE p.email IS NULL;
