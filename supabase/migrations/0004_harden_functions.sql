-- Endurece las funciones SECURITY DEFINER limitando quién puede ejecutarlas.

-- handle_new_user solo la invoca el trigger on_auth_user_created;
-- nadie debe poder ejecutarla directamente.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- is_duena / is_staff las usa RLS para usuarios autenticados; anon no las necesita.
revoke execute on function public.is_duena() from public, anon;
revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_duena() to authenticated;
grant execute on function public.is_staff() to authenticated;
