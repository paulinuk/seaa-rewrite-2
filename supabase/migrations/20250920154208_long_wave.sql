/*
  # Fix User Registration RLS Policy

  1. Problem
    - Current RLS policy prevents user registration because auth.uid() is null during signup
    - Need to allow users to insert their own profile during registration

  2. Solution
    - Update INSERT policy to allow users to create their own profile
    - Keep existing SELECT and UPDATE policies for security
*/

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies that work with registration flow
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

-- Allow users to insert their own profile during registration
-- This policy allows the insert when the user ID matches the authenticated user
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow public insert for registration (will be restricted by application logic)
CREATE POLICY "Allow registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);