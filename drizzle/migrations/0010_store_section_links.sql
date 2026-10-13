ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES public.website_sections(id), ADD COLUMN IF NOT EXISTS section_type text NOT NULL DEFAULT 'restaurant', ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'restaurant', ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.restaurants(id), ADD COLUMN IF NOT EXISTS category text, ADD COLUMN IF NOT EXISTS in_stock boolean NOT NULL DEFAULT true;
UPDATE public.menu_items SET store_id=restaurant_id WHERE store_id IS NULL;
CREATE INDEX IF NOT EXISTS restaurants_section_type_idx ON public.restaurants(section_type);
CREATE INDEX IF NOT EXISTS website_sections_position_idx ON public.website_sections(position);