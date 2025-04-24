/*
  # Update schema name to emergency_project
  
  1. Changes
    - Create new schema 'emergency_project'
    - Move all tables to new schema
    - Drop old schema if exists
*/

-- Create new schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS emergency_project;

-- Set search path to include both schemas
SET search_path TO emergency_project, public;

-- Move tables to new schema
ALTER TABLE IF EXISTS public.users SET SCHEMA emergency_project;
ALTER TABLE IF EXISTS public.organizations SET SCHEMA emergency_project;
ALTER TABLE IF EXISTS public.emergency_requests SET SCHEMA emergency_project;
ALTER TABLE IF EXISTS public.emergency_responses SET SCHEMA emergency_project;
ALTER TABLE IF EXISTS public.notifications SET SCHEMA emergency_project;

-- Move types to new schema
ALTER TYPE IF EXISTS public."UserRole" SET SCHEMA emergency_project;
ALTER TYPE IF EXISTS public."UserStatus" SET SCHEMA emergency_project;