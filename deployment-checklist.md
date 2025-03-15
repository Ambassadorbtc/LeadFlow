# Deployment Checklist for LeadFlow CRM

## Environment Variables
- [x] NEXT_PUBLIC_SUPABASE_URL - Already configured in vercel.json
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY - Already configured in vercel.json
- [x] SUPABASE_SERVICE_KEY - Already configured in vercel.json
- [x] SUPABASE_PROJECT_ID - Must be set for edge functions
- [x] NEXT_PUBLIC_TEMPO - Set to "true" in .env

## Edge Functions
- [x] sync_auth_users is deployed and working
- [x] create_users_table_if_not_exists is deployed and working
- [x] create_user_settings_if_not_exists is deployed and working
- [x] add_missing_columns is deployed and working
- [x] Edge Functions have proper CORS headers
- [x] Edge Functions have correct environment variables

## Database Setup
- [x] Run all migrations
- [x] Verify all tables exist
  - [x] users
  - [x] leads
  - [x] deals
  - [x] contacts
  - [x] companies
  - [x] notifications
  - [x] user_settings
  - [x] system_settings
- [x] Set up RLS policies
- [x] Enable realtime for required tables

## Authentication
- [x] Verify auth.users and public.users are synchronized
- [x] Test password reset functionality
- [x] Test sign-up and sign-in flows

## API Routes
- [x] Run /api/verify-deployment to check deployment status
- [x] Run /api/test-database to verify database connection and tables
- [x] Run /api/test-auth to verify authentication system
- [x] Run /api/test-api-routes to verify all critical API routes
- [x] Run /api/env-check to verify all environment variables are set
- [x] Run /api/health to check system health

## Build and Deploy
- [x] Build the Next.js application
- [x] Deploy to hosting platform

## Post-Deployment Verification
- [x] Verify all pages load correctly
- [x] Test authentication flows
- [x] Verify database connections
- [x] Check for any console errors
- [x] Test on multiple browsers and devices

## Performance
- [x] Verify API response times are acceptable
- [x] Check page load times
- [x] Monitor for any performance issues

## Security
- [x] Verify authentication is enabled
- [x] Check RLS policies are working
- [x] Ensure service role is properly restricted

## Monitoring and Maintenance
- [x] Set up monitoring for API endpoints
- [x] Configure error logging
- [x] Set up alerts for critical failures
- [x] Verify Supabase backup is configured

## Rollback Plan
- [x] Document rollback procedure
- [x] Ensure previous version is available for rollback
- [x] Test rollback process

## User Notification System
- [x] Verify notification system is working
- [x] Test notification creation and delivery
