/*
  # Initial Schema for Bridgent HomeStep EZ-Pay Platform

  ## Overview
  Creates the foundational database structure for a premium real estate rental platform
  with separate interfaces for tenants (EZ-Client), landlords (EZ-Partner), and administrators.

  ## New Tables Created
  
  ### 1. `profiles`
  Extends Supabase auth.users with additional user information
  - `id` (uuid, FK to auth.users)
  - `role` (enum: admin, landlord, tenant)
  - `full_name` (text)
  - `phone` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `landlord_profiles`
  Additional information for landlords
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `designation` (text)
  - `occupation` (text)
  - `residential_address` (text)
  - `nationality` (text)
  - `state_of_origin` (text)
  - `lga_of_origin` (text)
  - `place_of_work` (text)
  - `business_name` (text)
  - `business_address` (text)
  - `verification_status` (enum: pending, verified, rejected)
  - `created_at`, `updated_at` (timestamptz)

  ### 3. `properties`
  Property listings managed by the platform
  - `id` (uuid, PK)
  - `landlord_id` (uuid, FK to landlord_profiles)
  - `code_name` (text, unique) - Format: STATE-AREA-TYPE-ID
  - `property_address` (text)
  - `state` (text)
  - `area` (text)
  - `typology` (text) - e.g., Flat, Duplex, etc.
  - `number_of_units` (integer)
  - `desired_annual_rent` (numeric)
  - `monthly_cost` (numeric) - EZ-Pay calculated monthly rate
  - `availability_status` (enum: available, inspection_pending, rented, maintenance)
  - `onboarding_stage` (text) - Tracks admin onboarding workflow
  - `partnership_tier` (enum: ez_prime, ez_vantage)
  - `amenities` (jsonb) - Structured amenity data
  - `lead_image_url` (text)
  - `created_at`, `updated_at` (timestamptz)

  ### 4. `property_media`
  Media files for properties
  - `id` (uuid, PK)
  - `property_id` (uuid, FK to properties)
  - `media_type` (enum: exterior, interior, power_system, compound, document)
  - `file_url` (text)
  - `description` (text)
  - `created_at` (timestamptz)

  ### 5. `tenant_profiles`
  Additional information for tenants
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `current_address` (text)
  - `current_landlord_name` (text)
  - `current_landlord_contact` (text)
  - `reason_for_leaving` (text)
  - `duration_of_stay` (text)
  - `employer_name` (text)
  - `employer_contact` (text)
  - `payment_plan` (enum: ez_anchor, ez_ascend)
  - `verification_status` (enum: pending, verified, rejected)
  - `created_at`, `updated_at` (timestamptz)

  ### 6. `rental_applications`
  Tenant applications for properties
  - `id` (uuid, PK)
  - `property_id` (uuid, FK to properties)
  - `tenant_id` (uuid, FK to tenant_profiles)
  - `status` (enum: submitted, vetting_pending, approved, rejected)
  - `desired_start_date` (date)
  - `minimum_stay_months` (integer, default 4)
  - `payment_plan_preference` (enum: ez_anchor, ez_ascend)
  - `application_data` (jsonb) - Complete application form data
  - `admin_notes` (text)
  - `created_at`, `updated_at` (timestamptz)

  ### 7. `inspections`
  Scheduled property inspections
  - `id` (uuid, PK)
  - `property_id` (uuid, FK to properties)
  - `user_id` (uuid, FK to profiles)
  - `inspection_type` (enum: physical, virtual)
  - `scheduled_date` (timestamptz)
  - `status` (enum: scheduled, completed, cancelled)
  - `payment_status` (enum: pending, paid) - For physical inspections
  - `video_link` (text) - For virtual inspections
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 8. `leases`
  Active rental contracts
  - `id` (uuid, PK)
  - `property_id` (uuid, FK to properties)
  - `tenant_id` (uuid, FK to tenant_profiles)
  - `start_date` (date)
  - `end_date` (date)
  - `monthly_rent` (numeric)
  - `payment_plan` (enum: ez_anchor, ez_ascend)
  - `digital_access_code` (text)
  - `status` (enum: active, expired, terminated)
  - `lease_document_url` (text)
  - `created_at`, `updated_at` (timestamptz)

  ### 9. `documents`
  Uploaded verification documents
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `document_type` (text) - e.g., government_id, bank_statement, ownership_doc
  - `file_url` (text)
  - `verification_status` (enum: pending, verified, rejected)
  - `uploaded_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure users can only access their own data
  - Admin role has full access
  - Public can view available properties only
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'landlord', 'tenant');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE property_status AS ENUM ('available', 'inspection_pending', 'rented', 'maintenance');
CREATE TYPE partnership_tier AS ENUM ('ez_prime', 'ez_vantage');
CREATE TYPE media_type AS ENUM ('exterior', 'interior', 'power_system', 'compound', 'document');
CREATE TYPE payment_plan AS ENUM ('ez_anchor', 'ez_ascend');
CREATE TYPE application_status AS ENUM ('submitted', 'vetting_pending', 'approved', 'rejected');
CREATE TYPE inspection_type AS ENUM ('physical', 'virtual');
CREATE TYPE inspection_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid');
CREATE TYPE lease_status AS ENUM ('active', 'expired', 'terminated');
CREATE TYPE document_verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'tenant',
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Landlord profiles
CREATE TABLE IF NOT EXISTS landlord_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  designation text,
  occupation text,
  residential_address text,
  nationality text,
  state_of_origin text,
  lga_of_origin text,
  place_of_work text,
  business_name text,
  business_address text,
  verification_status verification_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES landlord_profiles(id) ON DELETE CASCADE,
  code_name text UNIQUE,
  property_address text NOT NULL,
  state text NOT NULL,
  area text NOT NULL,
  typology text NOT NULL,
  number_of_units integer DEFAULT 1,
  desired_annual_rent numeric NOT NULL,
  monthly_cost numeric,
  availability_status property_status DEFAULT 'available',
  onboarding_stage text DEFAULT 'submitted',
  partnership_tier partnership_tier,
  amenities jsonb DEFAULT '[]'::jsonb,
  lead_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Property media
CREATE TABLE IF NOT EXISTS property_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  media_type media_type NOT NULL,
  file_url text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Tenant profiles
CREATE TABLE IF NOT EXISTS tenant_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_address text,
  current_landlord_name text,
  current_landlord_contact text,
  reason_for_leaving text,
  duration_of_stay text,
  employer_name text,
  employer_contact text,
  payment_plan payment_plan,
  verification_status verification_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Rental applications
CREATE TABLE IF NOT EXISTS rental_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  status application_status DEFAULT 'submitted',
  desired_start_date date,
  minimum_stay_months integer DEFAULT 4,
  payment_plan_preference payment_plan,
  application_data jsonb DEFAULT '{}'::jsonb,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  inspection_type inspection_type NOT NULL,
  scheduled_date timestamptz NOT NULL,
  status inspection_status DEFAULT 'scheduled',
  payment_status payment_status DEFAULT 'pending',
  video_link text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Leases
CREATE TABLE IF NOT EXISTS leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  monthly_rent numeric NOT NULL,
  payment_plan payment_plan NOT NULL,
  digital_access_code text,
  status lease_status DEFAULT 'active',
  lease_document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_url text NOT NULL,
  verification_status document_verification_status DEFAULT 'pending',
  uploaded_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Landlord profiles policies
CREATE POLICY "Landlords can view own profile"
  ON landlord_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Landlords can insert own profile"
  ON landlord_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Landlords can update own profile"
  ON landlord_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all landlord profiles"
  ON landlord_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update landlord profiles"
  ON landlord_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Properties policies
CREATE POLICY "Anyone can view available properties"
  ON properties FOR SELECT
  USING (availability_status = 'available');

CREATE POLICY "Landlords can view own properties"
  ON properties FOR SELECT
  TO authenticated
  USING (
    landlord_id IN (
      SELECT id FROM landlord_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can insert own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (
    landlord_id IN (
      SELECT id FROM landlord_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Property media policies
CREATE POLICY "Anyone can view media for available properties"
  ON property_media FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE availability_status = 'available'
    )
  );

CREATE POLICY "Landlords can manage own property media"
  ON property_media FOR ALL
  TO authenticated
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      INNER JOIN landlord_profiles lp ON p.landlord_id = lp.id
      WHERE lp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all property media"
  ON property_media FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tenant profiles policies
CREATE POLICY "Tenants can view own profile"
  ON tenant_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Tenants can insert own profile"
  ON tenant_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Tenants can update own profile"
  ON tenant_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all tenant profiles"
  ON tenant_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Rental applications policies
CREATE POLICY "Tenants can view own applications"
  ON rental_applications FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can insert own applications"
  ON rental_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can view applications for their properties"
  ON rental_applications FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      INNER JOIN landlord_profiles lp ON p.landlord_id = lp.id
      WHERE lp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all applications"
  ON rental_applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Inspections policies
CREATE POLICY "Users can view own inspections"
  ON inspections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create inspections"
  ON inspections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all inspections"
  ON inspections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Leases policies
CREATE POLICY "Tenants can view own leases"
  ON leases FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can view leases for their properties"
  ON leases FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      INNER JOIN landlord_profiles lp ON p.landlord_id = lp.id
      WHERE lp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all leases"
  ON leases FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Documents policies
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can upload own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all documents"
  ON documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_availability ON properties(availability_status);
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_code_name ON properties(code_name);
CREATE INDEX IF NOT EXISTS idx_rental_applications_status ON rental_applications(status);
CREATE INDEX IF NOT EXISTS idx_rental_applications_property ON rental_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_rental_applications_tenant ON rental_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_inspections_user ON inspections(user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_property ON inspections(property_id);