
-- Add columns to users_profile table
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS avatar_url text;

-- Ensure RLS is enabled
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view/update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users_profile;
CREATE POLICY "Users can view own profile" 
ON public.users_profile FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users_profile;
CREATE POLICY "Users can update own profile" 
ON public.users_profile FOR UPDATE 
USING (auth.uid() = id);

