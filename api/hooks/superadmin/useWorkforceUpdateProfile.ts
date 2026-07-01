import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';

export interface WorkforceUpdateData {
    id_uin: string;
    full_name: string;
    phone: string;
    email: string;
    area_of_expertise: string[];
    preferred_working_area: string[];
    emergency_contact_number: string;
    id_proof: string[];
    resume_cv: string[];
    status: string;
    created_at?: string;
}

export function useWorkforceUpdateProfile(uin: string) {
    const [updateData, setUpdateData] = useState<WorkforceUpdateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUpdateData = async () => {
            if (!uin) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const { data, error: supabaseError } = await supabase
                    .from('workforce_update_profile')
                    .select('*')
                    .eq('id_uin', uin)
                    .eq('status', 'Pending')
                    .maybeSingle();

                if (supabaseError) {
                    throw supabaseError;
                }

                if (data) {
                    // Transform the data to match our interface
                    const transformedData: WorkforceUpdateData = {
                        id_uin: data.id_uin || '',
                        full_name: data.full_name || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        area_of_expertise: Array.isArray(data.area_of_expertise) 
                            ? data.area_of_expertise 
                            : data.area_of_expertise?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
                        preferred_working_area: Array.isArray(data.preferred_working_area)
                            ? data.preferred_working_area
                            : data.preferred_working_area?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
                        emergency_contact_number: data.emergency_contact_number || '',
                        id_proof: Array.isArray(data.id_proof) ? data.id_proof : [],
                        resume_cv: Array.isArray(data.resume_cv) ? data.resume_cv : [],
                        status: data.status || 'Pending',
                        created_at: data.created_at,
                    };
                    setUpdateData(transformedData);
                } else {
                    setUpdateData(null);
                }
            } catch (err: any) {
                console.error('Error fetching workforce update profile:', err);
                setError(err.message || 'Failed to fetch update data');
                setUpdateData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUpdateData();
    }, [uin]);

    return {
        updateData,
        loading,
        error,
        hasPendingUpdate: !!updateData,
    };
}