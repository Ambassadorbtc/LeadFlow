# Deployment Checklist for LeadFlow CRM

## Environment Variables
- [x] NEXT_PUBLIC_SUPABASE_URL - Already configured in vercel.json
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY - Already configured in vercel.json
- [x] SUPABASE_SERVICE_KEY - Already configured in vercel.json
- [x] SUPABASE_PROJECT_ID - Must be set for edge functions
- [x] NEXT_PUBLIC_TEMPO - Set to "true" in .env

## Edge Functions
- [ ] sync_auth_users is deployed and working
- [ ] create_users_table_if_not_exists is deployed and working
- [ ] create_user_settings_if_not_exists is deployed and working
- [ ] add_missing_columns is deployed and working
- [ ] Edge Functions have proper CORS headers
- [ ] Edge Functions have correct environment variables

## Database Setup
- [x] Run all migrations
- [ ] Verify all tables exist
  - [ ] users
  - [ ] leads
  - [ ] deals
  - [ ] contacts
  - [ ] companies
  - [ ] notifications
  - [ ] user_settings
  - [ ] system_settings
- [ ] Set up RLS policies
- [ ] Enable realtime for required tables

## Authentication
- [ ] Verify auth.users and public.users are synchronized
- [ ] Test password reset functionality
- [ ] Test sign-up and sign-in flows

## API Routes
- [ ] Run /api/verify-deployment to check deployment status
- [ ] Run /api/test-database to verify database connection and tables
- [ ] Run /api/test-auth to verify authentication system
- [ ] Run /api/test-api-routes to verify all critical API routes
- [ ] Run /api/env-check to verify all environment variables are set
- [ ] Run /api/health to check system health

## Build and Deploy
- [x] Build the Next.js application
- [x] Deploy to hosting platform

## Post-Deployment Verification
- [ ] Verify all pages load correctly
- [ ] Test authentication flows
- [ ] Verify database connections
- [ ] Check for any console errors
- [ ] Test on multiple browsers and devices

## Performance
- [ ] Verify API response times are acceptable
- [ ] Check page load times
- [ ] Monitor for any performance issues

## Security
- [ ] Verify authentication is enabled
- [ ] Check RLS policies are working
- [ ] Ensure service role is properly restricted

## Monitoring and Maintenance
- [ ] Set up monitoring for API endpoints
- [ ] Configure error logging
- [ ] Set up alerts for critical failures
- [ ] Verify Supabase backup is configured

## Rollback Plan
- [ ] Document rollback procedure
- [ ] Ensure previous version is available for rollback
- [ ] Test rollback process

## User Notification System
- [ ] Verify notification system is working
- [ ] Test notification creation and delivery
