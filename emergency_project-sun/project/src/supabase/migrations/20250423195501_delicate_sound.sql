/*
  # Create initial database schema
  
  1. New Schema
    - Create emergency_project schema
    - Set up all required tables and relationships
    - Enable RLS policies
*/

-- Create schema
CREATE SCHEMA IF NOT EXISTS emergency_project;

-- Set search path
SET search_path TO emergency_project, public;

-- Create enums
CREATE TYPE emergency_project."UserRole" AS ENUM ('PATIENT', 'EMERGENCY_CENTER', 'HOSPITAL', 'RESCUE_TEAM', 'ADMIN');
CREATE TYPE emergency_project."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- Create tables
CREATE TABLE IF NOT EXISTS emergency_project.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    role "UserRole" NOT NULL DEFAULT 'PATIENT',
    status "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "profileImageUrl" TEXT,
    "supabaseUserId" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "organizationId" UUID
);

CREATE TABLE IF NOT EXISTS emergency_project.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    "postalCode" TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS emergency_project.emergency_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    "medicalInfo" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "patientId" UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS emergency_project.emergency_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL,
    notes TEXT,
    "dispatchTime" TIMESTAMPTZ,
    "arrivalTime" TIMESTAMPTZ,
    "completionTime" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "organizationId" UUID NOT NULL,
    "emergencyRequestId" UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS emergency_project.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "userId" UUID NOT NULL
);

-- Add foreign key constraints
ALTER TABLE emergency_project.users
    ADD CONSTRAINT users_organizationId_fkey
    FOREIGN KEY ("organizationId")
    REFERENCES emergency_project.organizations(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE emergency_project.emergency_requests
    ADD CONSTRAINT emergency_requests_patientId_fkey
    FOREIGN KEY ("patientId")
    REFERENCES emergency_project.users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE emergency_project.emergency_responses
    ADD CONSTRAINT emergency_responses_organizationId_fkey
    FOREIGN KEY ("organizationId")
    REFERENCES emergency_project.organizations(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE emergency_project.emergency_responses
    ADD CONSTRAINT emergency_responses_emergencyRequestId_fkey
    FOREIGN KEY ("emergencyRequestId")
    REFERENCES emergency_project.emergency_requests(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE emergency_project.notifications
    ADD CONSTRAINT notifications_userId_fkey
    FOREIGN KEY ("userId")
    REFERENCES emergency_project.users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security
ALTER TABLE emergency_project.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_project.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_project.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_project.emergency_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_project.notifications ENABLE ROW LEVEL SECURITY;