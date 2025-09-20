/*
  # Secure Email Confirmation Registration Flow

  1. Security Model
    - Remove insecure anonymous policies
    - Require email confirmation before profile creation
    - Use database trigger for automatic profile creation
    - Maintain strict RLS for authenticated users only

  2. Changes
    - Drop existing insecure policies
    - Create secure authenticated-only policies
    - Add trigger function for profile creation after email confirmation
    - Store registration data in auth metadata during signup
*/

-- Drop all existing policies for users table
DROP POLICY IF EXISTS "Allow registration" ON users;
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
  -- Only create profile if email is confirmed and profile doesn't exist
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    INSERT INTO public.users (
      id, 
      email, 
      first_name, 
      surname, 
      user_type,
      club_id,
      club_role,
      telephone,
      mobile,
      club_colours
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'surname', ''),
      COALESCE(NEW.raw_user_meta_data->>'user_type', 'athlete'),
      CASE 
        WHEN NEW.raw_user_meta_data->>'club_id' IS NOT NULL 
        THEN (NEW.raw_user_meta_data->>'club_id')::uuid 
        ELSE NULL 
      END,
      NEW.raw_user_meta_data->>'club_role',
      NEW.raw_user_meta_data->>'telephone',
      NEW.raw_user_meta_data->>'mobile',
      NEW.raw_user_meta_data->>'club_colours'
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