REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_profile_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_branch_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_access_branch(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_do(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_manager() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.generate_occurrences(uuid, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_profile_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_branch_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_branch(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_do(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_occurrences(uuid, int) TO authenticated;
