# Bridgent HomeStep EZ-Pay Platform

A comprehensive real estate rental platform built with Next.js, featuring separate interfaces for tenants, landlords, and administrators.

## Features

### For Tenants (EZ-Client)
- Browse premium properties with verified standards
- Monthly payment options (no upfront yearly rent)
- Guaranteed 15+ hours of power with solar/inverter systems
- Book property inspections (physical or virtual)
- Submit rental applications with secure document upload
- Choose between EZ-Anchor (fixed rate) or EZ-Ascend (gradual increase) payment plans

### For Landlords (EZ-Partner)
- Two partnership tiers: EZ-Prime (ready properties) and EZ-Vantage (upgrade financing available)
- Multi-step property registration with comprehensive verification
- Property must meet ACCESSS Standard (Aesthetics, Space, Compound, Security, Services)
- Automated onboarding workflow with status updates
- Guaranteed consistent monthly income
- Zero property management burden

### For Administrators
- Comprehensive dashboard with analytics
- Property management (view, edit, update status)
- Application review and approval system
- Landlord and tenant profile management
- Real-time statistics and monitoring

## Tech Stack

- **Frontend**: Next.js 13.5.1, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Fonts**: Raleway, Open Sans, Montserrat, Great Vibes
- **Icons**: Lucide React

## Design System

### Brand Colors
- **Primary (Maroon)**: Authority and trust - `hsl(0 63% 31%)`
- **Secondary (Emerald Green)**: Financial health - `hsl(140 40% 45%)`
- **Accent (Metallic Gold)**: Premium quality - `hsl(45 100% 51%)`
- **Neutral**: Grey & White for cleanliness
- **Utility (Dodger Blue)**: Functional elements like chat

### Typography
- **Raleway**: Headers (H1-H3)
- **Open Sans**: Body text, form labels, paragraphs
- **Montserrat**: Subheadings, navigation links, CTAs
- **Great Vibes**: Accent taglines (used sparingly)

## Setup Instructions

### 1. Database Setup

The database schema has been created with the following tables:
- `profiles` - User profiles (extends Supabase auth)
- `landlord_profiles` - Additional landlord information
- `tenant_profiles` - Additional tenant information
- `properties` - Property listings
- `property_media` - Property photos and documents
- `rental_applications` - Tenant applications
- `inspections` - Scheduled property viewings
- `leases` - Active rental contracts
- `documents` - Uploaded verification documents

### 2. Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
/app
  /page.tsx                    # Landing page
  /landlord-partner/page.tsx   # Landlord registration
  /listings/page.tsx           # Property listings
  /listings/[codename]/page.tsx # Property details
  /listings/apply/[codename]/page.tsx # Rental application
  /admin/page.tsx              # Admin dashboard
/components
  /header.tsx                  # Navigation header
  /chat-widget.tsx             # Floating chat widget
  /ui/                         # Shadcn UI components
/lib
  /supabase.ts                 # Supabase client & types
```

## Key Pages

### Landing Page (/)
- Hero section with value proposition
- EZ-Client benefits (renters)
- EZ-Partner benefits (landlords)
- Primary CTAs to listings and partnership page

### Landlord Partner Page (/landlord-partner)
- Partnership tier comparison (EZ-Prime vs EZ-Vantage)
- ACCESSS Standard criteria explanation
- Multi-step property registration form:
  - Personal & Legal Information
  - Core Property Details
  - Document Uploads
  - Media Upload & Requirements

### Listings Page (/listings)
- Filterable property grid
- Search by location, type, or code
- Property cards with key details
- Real-time availability status

### Property Details Page (/listings/[codename])
- Comprehensive property information
- High-resolution images
- Amenities list
- Inspection booking modal
- Direct application link

### Rental Application Page (/listings/apply/[codename])
- Multi-step application form:
  - Bio & Current Residency
  - Financial & Employment
  - Identification & Security
  - Terms & Preferences
- Secure document upload
- Live photo/video verification

### Admin Dashboard (/admin)
- Statistics overview
- Property management table
- Application review system
- User management
- Status update capabilities

## Database Security

All tables have Row Level Security (RLS) enabled with policies that:
- Allow users to view and edit their own data
- Restrict property access based on availability
- Enable admins to view and manage all data
- Ensure data privacy and security

## Known Issues & Solutions

### Build Issue with Progress Component

There's a known compatibility issue between Next.js 13.5.1 and the Radix UI Progress component causing a build error. To resolve:

**Option 1**: Upgrade Next.js
```bash
npm install next@latest
```

**Option 2**: Use a custom Progress component
Create a simple custom progress bar without Radix UI dependencies.

**Option 3**: Run in development mode
The development server works perfectly:
```bash
npm run dev
```

## Future Enhancements

- Email notifications for application status updates
- Payment integration for inspection fees
- Virtual tour 360-degree viewer
- Advanced analytics for administrators
- Mobile application
- Multi-language support
- Integration with property management APIs

## License

Proprietary - Bridgent HomeStep EZ-Pay

## Support

For technical support or questions about the platform, contact the development team.
