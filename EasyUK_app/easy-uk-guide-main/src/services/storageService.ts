import { supabase } from "@/integrations/supabase/client";

/**
 * Storage Service
 * Wraps all file storage operations to enable easy backend migration
 */
export const storageService = {
  /**
   * Upload a file to storage
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { contentType?: string; cacheControl?: string }
  ) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        cacheControl: options?.cacheControl || '3600',
        upsert: false,
      });

    return { data, error };
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    return { data, error };
  },

  /**
   * Delete multiple files from storage
   */
  async deleteFiles(bucket: string, paths: string[]) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    return { data, error };
  },

  /**
   * List files in a directory
   */
  async listFiles(bucket: string, path?: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    return { data, error };
  },

  /**
   * Download a file
   */
  async downloadFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    return { data, error };
  },

  /**
   * Upload avatar for user
   */
  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return { url: data.publicUrl, error: null };
  },

  /**
   * Upload service photo
   */
  async uploadServicePhoto(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `services/${userId}/${Date.now()}-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return { url: data.publicUrl, error: null };
  },

  /**
   * Delete service photo by URL
   */
  async deleteServicePhotoByUrl(photoUrl: string) {
    // Extract the path from the public URL
    const url = new URL(photoUrl);
    const pathParts = url.pathname.split('/storage/v1/object/public/avatars/');
    
    if (pathParts.length < 2) {
      return { error: new Error('Invalid photo URL') };
    }

    const filePath = pathParts[1];
    return await this.deleteFile('avatars', filePath);
  },
};
