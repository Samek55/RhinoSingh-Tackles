// src/services/supabaseService.ts
import { supabase } from '@/src/lib/supabase';

export interface AnnouncementData {
  name: string;
  city: string[];
  user_selection: string[];
  profession?: string[];
  countdown_timer: number;
  image_url: string;
  message: string;
  button_text: string;
  button_link: string;
  start_date: string;
  end_date: string;
  uploaded_by: string;
  active?: boolean;
}

export const announcementService = {
  async createAnnouncement(data: AnnouncementData) {
    const { data: result, error } = await supabase
      .from('roadblock')
      .insert([{
        name: data.name,
        city: data.city,
        user_selection: data.user_selection,
        profession: data.profession || [],
        countdown_timer: data.countdown_timer,
        image_url: data.image_url,
        message: data.message,
        button_text: data.button_text,
        button_link: data.button_link,
        start_date: data.start_date,
        end_date: data.end_date,
        uploaded_by: data.uploaded_by,
        active: true
      }])
      .select();

    if (error) {
      console.error('Error creating roadblock:', error);
      throw error;
    }

    return result;
  },

  async getAllAnnouncements() {
    const { data, error } = await supabase
      .from('roadblock')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching roadblock:', error);
      throw error;
    }

    return data;
  },

  async toggleAnnouncementStatus(id: string, active: boolean) {
    const { data, error } = await supabase
      .from('roadblock')
      .update({ active })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating roadblock:', error);
      throw error;
    }

    return data;
  },

  async deleteAnnouncement(id: string) {
    const { error } = await supabase
      .from('roadblock')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting roadblock:', error);
      throw error;
    }
  },

  async updateAnnouncement(id: string, data: Partial<AnnouncementData>) {
    const { data: result, error } = await supabase
      .from('roadblock')
      .update(data)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating roadblock:', error);
      throw error;
    }

    return result;
  },

  async deleteImageFromStorage(imageUrl: string) {
    try {
      // Extract the file path from the image URL
      const url = new URL(imageUrl);
      const pathname = url.pathname;
      
      // Extract bucket and file path from the URL
      // Typical Supabase storage URL: /storage/v1/object/public/bucket-name/path/to/file
      const pathParts = pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === 'object') + 2;
      
      if (bucketIndex < 2) {
        throw new Error('Invalid image URL format');
      }

      const bucketName = pathParts[bucketIndex];
      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image from storage:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteImageFromStorage:', error);
      throw error;
    }
  }
};