import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getAuth, User } from 'firebase/auth';
import { supabase } from '@/src/lib/supabase'; 

export function useWorkforceProfile() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fbUser, setFbUser] = useState<User | null>(null);

    // Form states matching your exact schema fields
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [positionAppliedFor, setPositionAppliedFor] = useState('');
    const [preferredWorkingArea, setPreferredWorkingArea] = useState('');
    const [areaOfExpertise, setAreaOfExpertise] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [status, setStatus] = useState('');
    const [whatsapp, setWhatsapp] = useState('');

    useEffect(() => {
        const fetchWorkforceData = async () => {
            try {
                const auth = getAuth();
                const currentUser = auth.currentUser;

                if (!currentUser) {
                    setFetching(false);
                    return;
                }

                setFbUser(currentUser);

                // Extract the comparison token (First 10 characters)
                const identifier = currentUser.email || currentUser.phoneNumber || '';
                const matchToken = identifier.substring(0, 10);

                if (!matchToken) {
                    setFetching(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('workforce')
                    .select('*')
                    .eq('phone', matchToken)
                    .single();

                if (error) {
                    if (currentUser.email) setEmail(currentUser.email);
                    if (currentUser.phoneNumber) setPhone(currentUser.phoneNumber);
                    console.log('Supabase match fallback:', error.message);
                } else if (data) {
                    setFullName(data.full_name || '');
                    setPhone(data.phone || '');
                    setEmail(data.email || '');
                    setEmergencyContact(data.emergency_contact_number || '');
                    setStatus(data.status || '');
                    setWhatsapp(data.whatsapp || '');

                    // Safe conversion for Postgres arrays -> Comma strings
                    if (Array.isArray(data.position_applied_for)) {
                        setPositionAppliedFor(data.position_applied_for.join(', '));
                    } else {
                        setPositionAppliedFor(data.position_applied_for || '');
                    }

                    if (Array.isArray(data.area_of_expertise)) {
                        setAreaOfExpertise(data.area_of_expertise.join(', '));
                    } else {
                        setAreaOfExpertise(data.area_of_expertise || '');
                    }

                     if (Array.isArray(data.preferred_working_area)) {
                        setPreferredWorkingArea(data.preferred_working_area.join(', '));
                    } else {
                        setPreferredWorkingArea(data.preferred_working_area || '');
                    }
                }
            } catch (err) {
                console.error('Error loading profiles:', err);
            } finally {
                setFetching(false);
            }
        };

        fetchWorkforceData();
    }, []);

    const updateProfile = async (onSuccess: () => void) => {
        if (!fullName.trim() || !phone.trim() || !email.trim()) {
            Alert.alert("Error", "Name, Phone, and Email are strictly required.");
            return;
        }

        setLoading(true);
        
        const finalPayload = {
            full_name: fullName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            // Split back into arrays before saving back to Postgres
            position_applied_for: positionAppliedFor.split(',').map(s => s.trim()).filter(Boolean),
            area_of_expertise: areaOfExpertise.split(',').map(s => s.trim()).filter(Boolean),
            preferred_working_area: preferredWorkingArea.trim() || null,
            emergency_contact_number: emergencyContact.trim() || null,
            whatsapp: whatsapp.trim() || `https://api.whatsapp.com/send?phone=${phone.trim()}`,
            firebase_uid: fbUser?.uid || null
            // 'status' is omitted here to keep it protected unless intentional
        };

        try {
            const { error } = await supabase
                .from('workforce')
                .update(finalPayload)
                .eq('phone', phone);

            if (error) throw error;

            Alert.alert("Success", "Profile updated perfectly!");
            onSuccess();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return {
        fetching,
        loading,
        fbUser,
        fullName,
        setFullName,
        phone,
        setPhone,
        email,
        setEmail,
        positionAppliedFor,
        setPositionAppliedFor,
        preferredWorkingArea,
        setPreferredWorkingArea,
        areaOfExpertise,
        setAreaOfExpertise,
        emergencyContact,
        setEmergencyContact,
        status,
        whatsapp,
        updateProfile,
    };
}