# Deployment Verification Checklist

## Environment Variables
- [ ] SUPABASE_PROJECT_ID is set
- [ ] SUPABASE_SERVICE_KEY is set
- [ ] SUPABASE_URL is set
- [ ] SUPABASE_ANON_KEY is set
- [ ] NEXT_PUBLIC_SUPABASE_URL is set
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY is set

## Edge Functions
- [ ] sync_auth_users is deployed and working
- [ ] create_users_table_if_not_exists is deployed and working
- [ ] create_user_settings_if_not_exists is deployed and working
- [ ] add_missing_columns is deployed and working
- [ ] Edge Functions have proper CORS headers
- [ ] Edge Functions have correct environment variables

## Database Configuration
- [ ] All required tables exist
  - [ ] users
  - [ ] leads
  - [ ] deals
  - [ ] contacts
  - [ ] companies
  - [ ] notifications
  - [ ] user_settings
  - [ ] system_settings
- [ ] RLS policies are correctly set up
- [ ] Foreign key relationships are properly set up
- [ ] All migrations have been applied successfully
- [ ] Realtime is enabled for all required tables

## Authentication
- [ ] auth.users and public.users are properly synchronized
- [ ] Auth redirect URLs are correctly configured
- [ ] Password reset flow works in production
- [ ] Sign-up flow works in production

## API Routes
- [ ] All critical API routes are working
  - [ ] /api/verify-deployment
  - [ ] /api/test-database
  - [ ] /api/test-auth
  - [ ] /api/test-api-routes
  - [ ] /api/env-check
  - [ ] /api/health
- [ ] API routes are properly authenticated
- [ ] Error handling in API routes is working

## Build Configuration
- [ ] Next.js build output is correct
- [ ] No build-time errors in logs
- [ ] All dependencies are properly installed
- [ ] Correct Node.js version is used

## Post-Deployment Verification
- [ ] Run the /api/verify-deployment endpoint
- [ ] Run the /api/test-database endpoint
- [ ] Run the /api/test-auth endpoint
- [ ] Run the /api/test-api-routes endpoint
- [ ] Check browser console for any client-side errors

## Performance
- [ ] API response times are acceptable
- [ ] Page load times are acceptable
- [ ] No memory leaks or excessive resource usage

## Security
- [ ] Authentication is enabled
- [ ] RLS policies are configured
- [ ] Service role is properly restricted

## Backup Procedures
- [ ] Supabase backup is configured
- [ ] Backup restoration procedure is documented

## Monitoring
- [ ] Health check endpoints are set up
- [ ] Error logging is configured

## Rollback Plan
- [ ] Rollback procedure is documented
- [ ] Previous version is available for rollback

## User Notification System
- [ ] Notifications table is working
- [ ] Notification creation and delivery is working

## Tempo-Specific Configuration
- [ ] Tempo plugin is correctly configured in next.config.js
- [ ] Tempo initialization code is properly included
- [ ] Tempo error handling script is included in layout
