
ALTER FUNCTION public.is_super_admin_email(TEXT) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin_email(TEXT) FROM PUBLIC, anon;
