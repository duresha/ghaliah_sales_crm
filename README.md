# Ghaliah Sales CRM

A modern Customer Relationship Management (CRM) system built with Next.js, designed to help businesses manage their sales processes and customer interactions effectively.

## Features

- Secure Authentication (Email & Google OAuth Sign-in)
- Dashboard with Sales Analytics and Real-time Data Visualization
- User Role Management (Admin, Manager, Sales Rep)
- Modern UI with Glassmorphism Design, Tailwind CSS and Radix UI Components
- Responsive Design for Mobile and Desktop
- Protected Routes and API Endpoints
- Proposal Management System with Custom Add-ons
- Integration with Supabase Database
- Automated Workflows with n8n Webhooks
- Real-time Status and Error Tracking
- Toast Notifications for User Feedback
- Team Member Performance Tracking

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS with Glassmorphism Design
- **UI Components:** Radix UI
- **Authentication:** NextAuth.js
- **Form Handling:** React Hook Form
- **Data Validation:** Zod
- **Charts:** Recharts
- **State Management:** React Hooks
- **Database:** Supabase
- **Automation:** n8n Webhook Integration
- **Notifications:** Toast UI Components

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- Node.js (v18 or later)
- pnpm (v8 or later)
- Git

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/ghaliah-sales-crm.git
   cd ghaliah-sales-crm
   ```

2. Install dependencies using pnpm
   ```bash
   pnpm install
   ```

3. Set up environment variables
   - Create a `.env.local` file in the root directory
   - Copy the environment variables as shown in the Environment Variables section

4. Run the development server
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth (required for Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Webhook for automation
NEXT_PUBLIC_N8N_WEBHOOK_URL=your-n8n-webhook-url
```

### Getting Required API Keys

1. **NextAuth Secret**: Generate a secure random string for NEXTAUTH_SECRET
   ```bash
   openssl rand -base64 32
   ```

2. **Google OAuth**: 
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Set up OAuth credentials with authorized redirect URIs
   - Add `http://localhost:3000/api/auth/callback/google` as a redirect URI

3. **Supabase**: 
   - Create an account at [Supabase](https://supabase.com/)
   - Create a new project
   - Go to Settings > API and copy the URL and anon key

## Database Setup

The CRM uses Supabase for data storage with the following features:
- Secure row-level security (RLS) policies
- Structured tables for users, companies, proposals, and activities
- Foreign key constraints for data integrity
- Performance views for efficient data retrieval

### Database Migration

The project includes Supabase migration files in the `supabase/migrations` directory. To apply these migrations:

1. Install the Supabase CLI
2. Link your project with the CLI
3. Run migrations using:
   ```bash
   supabase db push
   ```

## Authentication

The system supports multiple authentication methods:
- Email/Password login
- Google OAuth

User roles are assigned based on email patterns or manually in the database:
- Admin: Full system access
- Manager: Can view all data and manage representatives
- Rep: Can manage assigned companies and proposals

## Testing the Application

For testing purposes, you can use these demo accounts:

- Admin: admin@ghaliah.com / admin@123
- Manager: rawam_manager@gmail.com / manager@123
- Sales Rep: rep@gmail.com / rep@123

## UI/UX Features

The application features a modern UI with:
- Glassmorphism design for cards and components
- Responsive tables with sorting and filtering
- Real-time form validation
- Multi-step processes with visual indicators
- Toast notifications for user actions
- Dark/light mode support

## Deployment

To deploy the application to production:

1. Build the production version:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

For cloud deployments, the application can be deployed to Vercel, Netlify, or any other platform that supports Next.js.

## License

Private - All rights reserved 
