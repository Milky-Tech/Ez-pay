export type Property = {
  id: string;
  landlord_id: string;
  code_name: string | null;
  property_address: string;
  state: string;
  area: string;
  typology: string;
  property_type: string;
  number_of_units: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  power_supply: boolean;
  description: string;
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
