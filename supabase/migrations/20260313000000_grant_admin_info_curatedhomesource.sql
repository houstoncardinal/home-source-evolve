-- Grant admin role to info@curatedhomesource (UID: 24b56d6f-a6cd-44b0-8fe5-dd937bcff66b)
INSERT INTO public.user_roles (user_id, role)
VALUES ('24b56d6f-a6cd-44b0-8fe5-dd937bcff66b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
