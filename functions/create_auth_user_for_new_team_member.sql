-- Function to create a Supabase auth user when a new team member is added
CREATE OR REPLACE FUNCTION create_auth_user_for_new_team_member()
RETURNS TRIGGER AS $$
DECLARE
  new_auth_id UUID;
  random_password TEXT;
BEGIN
  -- Generate a random password
  random_password := encode(gen_random_bytes(12), 'base64');
  
  -- Create a new user in the auth.users table using Supabase's internal function
  INSERT INTO auth.users (
    instance_id,
    id, 
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role,
    confirmation_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 
    NEW.email,
    -- This is a placeholder. In production, you would use a proper password hashing function
    crypt(random_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    format('{"name": "%s", "role": "%s"}', NEW.name, NEW.role)::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated',
    encode(gen_random_bytes(12), 'base64')
  )
  RETURNING id INTO new_auth_id;

  -- Update the user record with the new auth_id
  UPDATE public.users
  SET auth_id = new_auth_id
  WHERE id = NEW.id;

  -- Send an email invitation (would be implemented separately)
  -- For now, we'll just return the new record
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error (if you have error logging)
    -- If you want to stop the trigger from processing, you could:
    -- RAISE EXCEPTION 'Error creating auth user: %', SQLERRM;
    RETURN NEW; -- Return the record anyway to allow the insert
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
