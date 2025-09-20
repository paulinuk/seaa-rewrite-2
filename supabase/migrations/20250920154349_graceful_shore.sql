/*
  # Secure Registration Flow with Email Confirmation

  1. Security Model
    - Remove anonymous insert policy (security risk)
    - Users must confirm email before profile creation
    - Use Supabase Auth triggers for automatic profile creation
    - Maintain strict RLS policies

  2. Changes
    - Remove anonymous insert policy
    - Add trigger to auto-create user profile after email confirmation
    - Keep secure RLS policies for authenticated users only
*/

-- Remove the insecure anonymous policy
DROP POLICY IF EXISTS "Allow registration" ON users;

-- Ensure we have proper authenticated-only policies
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create secure policies for authenticated users only
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to handle user profile creation after email confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only create profile if email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    INSERT INTO public.users (id, email, first_name, surname, user_type)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'surname', ''),
      COALESCE(NEW.raw_user_meta_data->>'user_type', 'athlete')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile after email confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();