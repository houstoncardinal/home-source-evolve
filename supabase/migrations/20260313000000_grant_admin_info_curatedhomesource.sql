-- Grant admin role to info@curatedhomesource (UID: e8960e1a-85cf-49fc-ab5c-227731651da4)
INSERT INTO public.user_roles (user_id, role)
VALUES ('e8960e1a-85cf-49fc-ab5c-227731651da4', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
