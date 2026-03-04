CREATE TABLE public.order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  notification_type text NOT NULL DEFAULT 'order_confirmation',
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert notifications" ON public.order_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can read notifications" ON public.order_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update notifications" ON public.order_notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);