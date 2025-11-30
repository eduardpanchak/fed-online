-- Add storage policy for service photo uploads
-- This allows authenticated users to upload photos for their services

-- Policy to allow authenticated users to upload service photos
CREATE POLICY "Users can upload service photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'services'
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- Policy to allow authenticated users to update their service photos
CREATE POLICY "Users can update their service photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'services'
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- Policy to allow authenticated users to delete their service photos
CREATE POLICY "Users can delete their service photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'services'
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- Policy to allow public read access to service photos
CREATE POLICY "Service photos are publicly readable"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'services'
);