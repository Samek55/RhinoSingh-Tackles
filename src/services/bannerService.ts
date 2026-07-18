import { supabase } from '@/src/lib/supabase';

export interface Banner {
  id: number;
  name: string;
  city: string[];
  user_selection: string[];
  profession: string[];
  countdown_timer: number;
  image_url: string;
  message: string;
  button_text: string;
  button_link: string;
  start_date: string;
  end_date: string;
  uploaded_by: string;
  active: boolean;
  created_at: string;
}

export const bannerService = {
  // Get all active banners
  getActiveBanners: async (): Promise<Banner[]> => {
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log('Fetching active banners for date:', now);
    
    const { data, error } = await supabase
      .from('roadblock')
      .select('*')
      .eq('active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching banners:', error);
      return [];
    }

    console.log('Active banners found:', data?.length || 0);
    return data || [];
  },

  // Get banners for specific user
  getBannersForUser: async (userCity?: string, userType?: string, userProfession?: string): Promise<Banner[]> => {
    const now = new Date().toISOString().split('T')[0];
    
    console.log('Fetching user banners for:', { userCity, userType, userProfession });
    
    let query = supabase
      .from('roadblock')
      .select('*')
      .eq('active', true)
      .lte('start_date', now)
      .gte('end_date', now);

    // Filter by city if user has one
    if (userCity) {
      query = query.contains('city', [userCity]);
    }

    // Filter by user type if specified
    if (userType) {
      query = query.contains('user_selection', [userType]);
    }

    // Filter by profession if user is workforce
    if (userProfession) {
      query = query.contains('profession', [userProfession]);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user banners:', error);
      return [];
    }

    console.log('User banners found:', data?.length || 0);
    return data || [];
  },

  // Get single banner by ID
  getBannerById: async (id: number): Promise<Banner | null> => {
    const { data, error } = await supabase
      .from('roadblock')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching banner:', error);
      return null;
    }

    return data;
  },
};