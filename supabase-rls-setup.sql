-- Supabase RLS Policy Setup
-- Run these SQL commands in the Supabase SQL Editor to configure RLS policies

-- Option 1: Disable RLS for proposals table during development
-- WARNING: This removes all row security, only use in development!
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;

-- Option 2: Create permissive RLS policies
-- Use this in production to maintain security while allowing operations

-- 1. Enable RLS but add policies
-- ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- 2. Create policy for authenticated users to see all proposals
-- CREATE POLICY "Users can view all proposals" ON proposals
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- 3. Create policy for authenticated users to insert proposals
-- CREATE POLICY "Users can insert proposals" ON proposals
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- 4. Create policy for authenticated users to update their own proposals
-- CREATE POLICY "Users can update their own proposals" ON proposals
--   FOR UPDATE
--   TO authenticated
--   USING (true);

-- Check if RLS is enabled or disabled:
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proposals';

-- List all policies on the proposals table:
SELECT * FROM pg_policies WHERE tablename = 'proposals'; 
