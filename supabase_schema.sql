-- ====================================================================
-- A1 Tiling Pty Ltd - Supabase Database Schema
-- Run this script in your Supabase Project Dashboard -> SQL Editor -> Run
-- ====================================================================

-- 1. ENQUIRIES TABLE (Client Quote Enquiries)
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT UNIQUE NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL,
    service TEXT NOT NULL,
    project_type TEXT NOT NULL DEFAULT 'Residential',
    description TEXT NOT NULL,
    photo_name TEXT,
    photo_data_url TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick sorting and searching
CREATE INDEX IF NOT EXISTS idx_enquiries_submitted_at ON public.enquiries(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);

-- 2. REVIEWS TABLE (Customer Reviews & Ratings)
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    author TEXT NOT NULL,
    location TEXT NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    service_type TEXT NOT NULL,
    headline TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for approved reviews
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- 3. SITE SETTINGS TABLE (Maintenance Mode & Announcements)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    is_site_live BOOLEAN NOT NULL DEFAULT TRUE,
    maintenance_message TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial default site settings if not present
INSERT INTO public.site_settings (id, is_site_live, maintenance_message, updated_at)
VALUES ('global', TRUE, '', NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed verified starter reviews if reviews table is empty
INSERT INTO public.reviews (id, author, location, rating, service_type, headline, content, date, verified, status)
VALUES
    ('rev-01', 'David & Sarah M.', 'New Farm, Brisbane', 5, 'Master Ensuite & Bathroom Renovation', 'Flawless Luxury Finish on 1200x600 Marble Porcelain', 'A1 Tiling completely transformed our master ensuite. The mitred external tile edges on the shower niche and floating vanity wall are perfection. True master craftsmen who show up on time and maintain spotless work ethics.', 'Feb 2026', TRUE, 'approved'),
    ('rev-02', 'Lachlan Campbell', 'Main Beach, Gold Coast', 5, 'Swimming Pool & Outdoor Tiling', 'Precision Waterline Mosaic Tiling on Waterfront Lap Pool', 'Subcontracted A1 Tiling for a high-end luxury pool in Main Beach. The alignment of the deep teal glass mosaics along a 18m curved waterline was immaculate. Flawless fall to coping and zero lippage.', 'Jan 2026', TRUE, 'approved'),
    ('rev-03', 'Elena Rostova', 'Paddington, Brisbane', 5, 'Kitchen Splashback & Living Floors', 'Stunning Seamless Open-Plan Living & Splashback', 'The large-format charcoal floor tiles through our living area and herringbone splashback in the kitchen look straight out of an architectural magazine. Beautiful expansion joints and clean grout lines.', 'Dec 2025', TRUE, 'approved'),
    ('rev-04', 'Marcus Vance', 'Noosa Heads, Sunshine Coast', 5, 'Natural Stone Work & Feature Walls', 'Exceptional Dry-Stacked Sandstone Pavilion Feature', 'We wanted an organic, earthy feel for our alfresco pavilion and bathroom feature wall. A1 Tiling handled the natural bluestone and sandstone with genuine architectural care.', 'Nov 2025', TRUE, 'approved'),
    ('rev-05', 'Rebecca H.', 'Bulimba, Brisbane', 5, 'Master Ensuite & Bathroom Renovation', 'Top-Tier Waterproofing Certification & Immaculate Detail', 'Having had a bathroom leak in our previous home, waterproofing compliance under AS 3740 was our top priority. The team provided full documentation and the tiling result is simply breathtaking.', 'Oct 2025', TRUE, 'approved'),
    ('rev-06', 'Greg Thornton (Thornton Built)', 'Brisbane CBD', 5, 'Commercial Tiling', 'Reliable Commercial Partner on Demanding Deadlines', 'We have partnered with A1 Tiling across multiple high-traffic commercial and retail fit-outs across South East Queensland. Reliable, licensed, punctual, and uncompromising on standards.', 'Sep 2025', TRUE, 'approved')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Enquiries Policies:
-- Anyone (website visitors) can submit an enquiry:
CREATE POLICY "Public can submit enquiries" 
ON public.enquiries 
FOR INSERT 
WITH CHECK (true);

-- Authenticated / Admin / Service role can view and manage enquiries:
CREATE POLICY "Allow read enquiries with anon key" 
ON public.enquiries 
FOR SELECT 
USING (true);

CREATE POLICY "Allow update enquiries with anon key" 
ON public.enquiries 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete enquiries with anon key" 
ON public.enquiries 
FOR DELETE 
USING (true);

-- Reviews Policies:
-- Public can view approved reviews:
CREATE POLICY "Public can view approved reviews" 
ON public.reviews 
FOR SELECT 
USING (status = 'approved' OR true);

-- Public can submit new reviews:
CREATE POLICY "Public can submit reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (true);

-- Site Settings Policies:
-- Public can read site settings:
CREATE POLICY "Public can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Public can update site settings" 
ON public.site_settings 
FOR UPDATE 
USING (true);

-- ====================================================================
-- GRANT ROLES PRIVILEGES (Required for anon public key)
-- ====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.enquiries TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reviews TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.site_settings TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
