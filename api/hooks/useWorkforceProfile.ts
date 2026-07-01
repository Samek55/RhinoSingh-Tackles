import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getAuth, User } from 'firebase/auth';
import { supabase } from '@/src/lib/supabase';

export function useWorkforceProfile() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fbUser, setFbUser] = useState<User | null>(null);
    const [idUin, setIdUin] = useState('');
    const [idProof, setIdProof] = useState<string[]>([]);
    const [resumeCv, setResumeCv] = useState<string[]>([]);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [preferredWorkingArea, setPreferredWorkingArea] = useState('');
    const [areaOfExpertise, setAreaOfExpertise] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');

    const [initialValues, setInitialValues] = useState({
        fullName: '',
        phone: '',
        email: '',
        preferredWorkingArea: '',
        areaOfExpertise: '',
        emergencyContact: '',
        idProof: [] as string[],
        resumeCv: [] as string[],
        idUin: '',
    });

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
                const identifier = currentUser.email || currentUser.phoneNumber || '';
                const matchToken = identifier.substring(0, 10);

                if (!matchToken) {
                    setFetching(false);
                    return;
                }

                // FETCH FROM: 'workforce' table
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
                    const newIdUin = data.uin || '';
                    const newIdProof = data.id_proof || [];
                    const newResumeCv = data.resume_cv || [];
                    const newFullName = data.full_name || '';
                    const newPhone = data.phone || '';
                    const newEmail = data.email || '';
                    const newEmergencyContact = data.emergency_contact_number || '';
                    
                    let newAreaOfExpertise = '';
                    if (Array.isArray(data.area_of_expertise)) {
                        newAreaOfExpertise = data.area_of_expertise.join(', ');
                    } else {
                        newAreaOfExpertise = data.area_of_expertise || '';
                    }

                    let newPreferredWorkingArea = '';
                    if (Array.isArray(data.preferred_working_area)) {
                        newPreferredWorkingArea = data.preferred_working_area.join(', ');
                    } else {
                        newPreferredWorkingArea = data.preferred_working_area || '';
                    }

                    setIdUin(newIdUin);
                    setIdProof(newIdProof);
                    setResumeCv(newResumeCv);
                    setFullName(newFullName);
                    setPhone(newPhone);
                    setEmail(newEmail);
                    setEmergencyContact(newEmergencyContact);
                    setAreaOfExpertise(newAreaOfExpertise);
                    setPreferredWorkingArea(newPreferredWorkingArea);

                    setInitialValues({
                        fullName: newFullName,
                        phone: newPhone,
                        email: newEmail,
                        preferredWorkingArea: newPreferredWorkingArea,
                        areaOfExpertise: newAreaOfExpertise,
                        emergencyContact: newEmergencyContact,
                        idProof: newIdProof,
                        resumeCv: newResumeCv,
                        idUin: newIdUin,
                    });
                }
            } catch (err) {
                console.error('Error loading profiles:', err);
            } finally {
                setFetching(false);
            }
        };

        fetchWorkforceData();
    }, []);

    const resetProfile = () => {
        setFullName(initialValues.fullName);
        setPhone(initialValues.phone);
        setEmail(initialValues.email);
        setPreferredWorkingArea(initialValues.preferredWorkingArea);
        setAreaOfExpertise(initialValues.areaOfExpertise);
        setEmergencyContact(initialValues.emergencyContact);
        setIdProof(initialValues.idProof);
        setResumeCv(initialValues.resumeCv);
        setIdUin(initialValues.idUin);
    };

    // IMPORTANT: This function now expects image URLs to be passed in
    const saveProfile = async (idProofUrls: string[], resumeCvUrls: string[], onSuccess: () => void) => {
        if (!fullName.trim() || !phone.trim() || !email.trim()) {
            Alert.alert("Error", "Name, Phone, and Email are strictly required.");
            return;
        }

        setLoading(true);

        const cleanExpertiseArr = areaOfExpertise.split(',').map(s => s.trim()).filter(Boolean);
        const cleanWorkingAreaArr = preferredWorkingArea.split(',').map(s => s.trim()).filter(Boolean);

        const finalPayload = {
            id_uin: idUin || null,
            full_name: fullName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            area_of_expertise: cleanExpertiseArr.length > 0 ? cleanExpertiseArr : null,
            preferred_working_area: cleanWorkingAreaArr.length > 0 ? cleanWorkingAreaArr : null,
            emergency_contact_number: emergencyContact.trim() || null,
            id_proof: idProofUrls, // Use the URLs passed in
            resume_cv: resumeCvUrls, // Use the URLs passed in
            status: 'Pending'
        };

        try {
            const { error } = await supabase
                .from('workforce_update_profile')
                .insert([finalPayload]);

            if (error) throw error;

            Alert.alert("Success", "Profile update request saved!");
            onSuccess();
        } catch (error: any) {
            console.log("Database write error detail:", error);
            Alert.alert("Error", error.message || "Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    return {
        idUin,
        fetching,
        loading,
        fullName,
        setFullName,
        phone,
        email,
        setEmail,
        preferredWorkingArea,
        setPreferredWorkingArea,
        areaOfExpertise,
        setAreaOfExpertise,
        emergencyContact,
        setEmergencyContact,
        idProof,
        setIdProof,
        resumeCv,
        setResumeCv,
        saveProfile,
        resetProfile,
    };
}