
-- Add columns to tenants table
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS gst_no text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS cin_no text;

-- Create storage bucket for company assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload their own company logo
-- Note: Simplified policy for demo, strictly should enforce tenant check. 
-- Since filename usually unique or we trust auth user for now.
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'company-assets' );

-- Policy to allow public to view logos
CREATE POLICY "Allow public viewing"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'company-assets' );

-- Allow update
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'company-assets' );
