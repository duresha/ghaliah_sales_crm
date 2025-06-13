# Ghaliah Sales CRM

A modern Customer Relationship Management (CRM) system built with Next.js, designed to help businesses manage their sales processes and customer interactions effectively.

## Features

- 🔐 Secure Authentication (Email & Google OAuth Sign-in)
- 📊 Dashboard with Sales Analytics
- 👥 User Role Management (Admin, Manager, Sales Rep)
- 🎨 Modern UI with Tailwind CSS and Radix UI Components
- 📱 Responsive Design
- 🔒 Protected Routes and API Endpoints
- 📝 Proposal Management System
- 🔄 Integration with Supabase Database
- 🤖 Automated Workflows with n8n Webhooks
- ✅ Real-time Status and Error Tracking
- 🔔 Toast Notifications for User Feedback

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Authentication:** NextAuth.js
- **Form Handling:** React Hook Form
- **Data Validation:** Zod
- **Charts:** Recharts
- **State Management:** React Hooks
- **Database:** Supabase
- **Automation:** n8n Webhook Integration
- **Notifications:** Toast UI Components

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Accounts

- Admin: admin@ghaliah.com / admin123
- Manager: manager@ghaliah.com / manager123
- Sales Rep: rep@ghaliah.com / rep123

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_N8N_WEBHOOK_URL=your-n8n-webhook-url
```

## Database Integration

The CRM integrates with Supabase for data storage with the following features:
- Secure row-level security (RLS) policies
- Structured tables for users, companies, proposals, and activities
- Foreign key constraints for data integrity
- Real-time data synchronization

## Automation Workflows

The system uses n8n webhooks to automate business processes:
- Automatically processes new proposals after database insertion
- Triggers custom workflows based on proposal data
- Provides error handling and retry mechanisms
- Supports multi-step approval processes

## UI/UX Improvements

- **Test Status Component:** Visual indicator for tracking multi-step processes
- **Toast Notifications:** Real-time feedback for user actions
- **Form Validation:** Immediate feedback on input errors
- **Loading States:** Clear indication of background processes

## License

Private - All rights reserved 
