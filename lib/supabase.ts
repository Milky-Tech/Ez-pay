import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  role: 'admin' | 'landlord' | 'tenant';
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Property = {
  id: string;
  landlord_id: string;
  code_name: string | null;
  property_address: string;
  state: string;
  area: string;
  typology: string;
  number_of_units: number;
  desired_annual_rent: number;
  monthly_cost: number | null;
  availability_status: 'available' | 'inspection_pending' | 'rented' | 'maintenance';
  onboarding_stage: string;
  partnership_tier: 'ez_prime' | 'ez_vantage' | null;
  amenities: any;
  lead_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type RentalApplication = {
  id: string;
  property_id: string;
  tenant_id: string;
  status: 'submitted' | 'vetting_pending' | 'approved' | 'rejected';
  desired_start_date: string | null;
  minimum_stay_months: number;
  payment_plan_preference: 'ez_anchor' | 'ez_ascend' | null;
  application_data: any;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};
