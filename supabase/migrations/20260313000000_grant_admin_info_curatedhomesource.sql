-- Grant admin role to info@curatedhomesource (UID: 46b9a04c-9c50-4b95-bda2-253b2b8b0581)
INSERT INTO public.user_roles (user_id, role)
VALUES ('46b9a04c-9c50-4b95-bda2-253b2b8b0581', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
