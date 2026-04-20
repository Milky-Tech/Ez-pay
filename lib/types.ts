export type Property = {
  id: string;
  landlord_id: string;
  code_name: string | null;
  property_address: string;
  state: string;
  area: string;
  rent: number;
  typology: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  parking_space: number;
  square_feet: number;
  desired_annual_rent: number;
  monthly_cost: number | null;
  monthly_rent: number;
  caution_fee: number;
  payback_amount: number;
  inspection_fee: number;
  listing_status: "available" | "rented" | "occupied" | "maintenance" | "upgrade_pending";
  availability: "available" | "rented" | "occupied" | "maintenance";
  status: "pending" | "approved" | "rejected" | "published";
  availability_status:
    | "available"
    | "inspection_pending"
    | "rented"
    | "maintenance"
    | "upgrade_pending";
  partnership_tier: "ez_prime" | "ez_vantage" | null;
  landlord_package: "prime" | "vantage" | null;
  interior_rooms: string | string[];
  exterior_shot: string;
  compound_road: string;
  power_system: string;
  deeds_of_assignment: string;
  building_approval: string;
  c_of_o: string;
  created_at: string;
  updated_at: string;
  locationData?: { latitude: number; longitude: number };
  location_data?: { latitude: number; longitude: number };
  landlord?: {
    full_name: string;
    phone: string;
    email: string;
  };
};

export type RentalApplication = {
  id: string;
  property_id: string;
  tenant_id: string;
  status: "submitted" | "vetting_pending" | "approved" | "rejected";
  desired_start_date: string | null;
  minimum_stay_months: number;
  payment_plan_preference: "ez_anchor" | "ez_ascend" | null;
  application_data: any;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};
