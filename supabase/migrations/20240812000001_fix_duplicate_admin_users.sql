-- Delete the incorrect admin user with the typo in email
DELETE FROM public.users
WHERE email = 'admin@leadfowapp.online';

-- Make sure there's only one admin user with the correct email
DELETE FROM public.users
WHERE email = 'admin@leadflowapp.online' 
AND id NOT IN (
  SELECT id FROM public.users 
  WHERE email = 'admin@leadflowapp.online' 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Update the remaining admin user to have consistent information
UPDATE public.users
SET full_name = 'Admin User'
WHERE email = 'admin@leadflowapp.online';
