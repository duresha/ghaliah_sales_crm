-- Sample data setup for Ghaliah CRM
-- Run these commands in Supabase SQL Editor when you're ready to use real company data

-- First, insert a test user (update with your actual login credentials)
INSERT INTO users (id, name, email, phone, role)
VALUES 
('11111111-1111-4111-a111-111111111111', 'Test Admin', 'test@example.com', '+1234567890', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample companies with the exact UUIDs used in the application
INSERT INTO companies (id, name, industry, region, status)
VALUES 
('3fa85f64-5717-4562-b3fc-2c963f66afa1', 'TechCorp Solutions', 'Technology', 'Riyadh', 'Lead'),
('3fa85f64-5717-4562-b3fc-2c963f66afa2', 'Global Manufacturing Inc', 'Manufacturing', 'Jeddah', 'Lead'),
('3fa85f64-5717-4562-b3fc-2c963f66afa3', 'Financial Services Co', 'Finance', 'Dubai', 'Lead'),
('3fa85f64-5717-4562-b3fc-2c963f66afa4', 'Healthcare Systems Ltd', 'Healthcare', 'Riyadh', 'Lead'),
('3fa85f64-5717-4562-b3fc-2c963f66afa5', 'StartupXYZ', 'Technology', 'Dubai', 'Lead'),
('3fa85f64-5717-4562-b3fc-2c963f66afa6', 'Enterprise Co', 'Consulting', 'Jeddah', 'Lead')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  industry = EXCLUDED.industry,
  region = EXCLUDED.region;

-- When you're ready to use real company data, modify the proposal-form.tsx file:
-- 1. Uncomment the line that uses companyIdMap
-- 2. Comment out the line that sets companyId to null 
