-- Create get_total_deal_value function if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_total_deal_value()
 RETURNS numeric
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT COALESCE(SUM(value), 0) FROM public.deals WHERE user_id = auth.uid();
$function$;
