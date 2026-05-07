// app/types/property.ts

export interface Property {
  id: string;
  code_name?: string;
  typology: string;
  email?: string;
  phone?: string;
  area: string;
  state: string;
  monthly_cost?: number | null;
  listing_status: string | null;
  status: string;
  full_name?: string;
  property_address: string;
  rent: number;
  monthly_rent?: number;
  caution_fee?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_space?: number;
  deeds_of_assignment?: string;
  building_approval?: string;
  payback_amount?: number;
  upgrade_loan?: number;
  amortization_period?: number;
  compound_road?: string;
  power_system?: string;
  interior_rooms?: string | string[];
  exterior_shot?: string;
  landlord_package: string;
  c_of_o?: string;
  ownershipDoc?: string;
  govId?: string;
  cacCert?: string;
  latitude?: number;
  longitude?: number;
  locationData?: {
    lat: string;
    long: string;
    address: string;
    state: string;
    city: string;
  };
  landlord?: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
  };
  created_at: string;
  updated_at?: string;
  business_name?: string;
  business_address?: string;
  designation?: string;
  occupation?: string;
  place_of_work?: string;
  nationality?: string;
  state_of_origin?: string;
  lga_of_origin?: string;
  residential_address?: string;
  [key: string]: any;
}

export interface Landlord {
  id: string;
  full_name: string;
  fullName?: string; // For backward compatibility
  email: string;
  phone: string;
  password?: string;
  password_confirmation?: string;
  designation?: string;
  occupation?: string;
  nationality?: string;
  state_of_origin?: string;
  lga_of_origin?: string;
  residential_address?: string;
  place_of_work?: string;
  business_name?: string;
  business_address?: string;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  status: string;
  role: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Application {
  id: string;
  unique_id: string;
  status: string;
  tenant_package: string;
  listing_id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  current_address: string;
  current_landlord_name: string;
  current_landlord_contact: string;
  reason_for_leaving: string;
  duration_of_stay: string;
  company_name: string;
  job_title: string;
  monthly_income: number;
  hr_contact: string;
  desired_start_date: string;
  payment_plan: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  guarantor_name?: string;
  guarantor_phone?: string;
  guarantor_email?: string;
  guarantor_id_number?: string;
  guarantor_workplace?: string;
  guarantor_id_path?: string;
  attestation_letter_path?: string;
  bank_statement_path: string;
  government_id_path: string;
  live_photo_path: string;
  verification_video_path: string;
  created_at: string;
  updated_at: string;
  properties?: {
    code_name?: string;
    typology?: string;
  };
}
