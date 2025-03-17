#!/bin/bash

# Deploy all edge functions
echo "Deploying all edge functions..."

# Deploy sync_auth_users
echo "Deploying sync_auth_users..."
supabase functions deploy sync_auth_users

# Deploy create_users_table_if_not_exists
echo "Deploying create_users_table_if_not_exists..."
supabase functions deploy create_users_table_if_not_exists

# Deploy create_user_settings_if_not_exists
echo "Deploying create_user_settings_if_not_exists..."
supabase functions deploy create_user_settings_if_not_exists

# Deploy add_missing_columns
echo "Deploying add_missing_columns..."
supabase functions deploy add_missing_columns

echo "All edge functions deployed successfully!"
