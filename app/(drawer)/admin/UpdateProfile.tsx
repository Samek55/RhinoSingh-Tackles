import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StyleSheet,
    ActivityIndicator,
    Modal,
    FlatList,
    Alert,
    Image,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useWorkforceProfile } from '@/api/hooks/useWorkforceProfile';
import { supabase } from '@/src/lib/supabase';

// --- DATA SOURCE IMPORT ---
import { services, area } from '@/src/data/Data';
import Header4 from '@/components/Header4Admin';
import { uploadWorkforceDocument } from '@/src/utils/uploadWorkforceUpdate';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FieldProps {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    icon: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    keyboardType?: 'default' | 'number-pad' | 'email-address';
    editable?: boolean;
}

interface DropdownListProps {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    icon: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    options: string[];
    maxSelect: number;
}

// Reusable Multi-Select Dropdown Component (Optimized with React.memo)
const ProfileDropdownArrayList = React.memo(({
    label,
    value,
    onChangeText,
    icon,
    placeholder,
    options = [],
    maxSelect
}: DropdownListProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const selectedItems = useMemo(() =>
        value ? value.split(',').map(item => item.trim()).filter(Boolean) : [],
        [value]
    );

    const toggleItem = useCallback((item: string) => {
        let updatedItems;
        if (selectedItems.includes(item)) {
            updatedItems = selectedItems.filter(i => i !== item);
        } else {
            if (selectedItems.length >= maxSelect) {
                Alert.alert(
                    'Limit Reached',
                    `You can select a maximum of ${maxSelect} items for ${label}.`
                );
                return;
            }
            updatedItems = [...selectedItems, item];
        }
        onChangeText(updatedItems.join(', '));
    }, [selectedItems, maxSelect, label, onChangeText]);

    const removeItem = useCallback((itemToRemove: string) => {
        const updatedItems = selectedItems.filter(item => item !== itemToRemove);
        onChangeText(updatedItems.join(', '));
    }, [selectedItems, onChangeText]);

    const filteredOptions = useMemo(() =>
        options.filter(option => option?.toLowerCase().includes(searchQuery.toLowerCase())),
        [options, searchQuery]
    );

    const handleClose = () => {
        setModalVisible(false);
        setSearchQuery('');
    };

    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>
                {label} <Text style={styles.limitHint}>({selectedItems.length}/{maxSelect})</Text>
            </Text>

            {/* Selected Badge Grid Layout */}
            {selectedItems.length > 0 && (
                <View style={styles.arrayBadgeRow}>
                    {selectedItems.map((item, index) => (
                        <View key={index} style={styles.chip}>
                            <Text style={styles.chipText}>{item}</Text>
                            <TouchableOpacity onPress={() => removeItem(item)} style={styles.chipCloseButton}>
                                <Ionicons name="close-circle" size={16} color="#16A34A" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {/* Form Input Selector Box */}
            <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Ionicons name={icon} size={20} color="#9CA3AF" style={styles.inputIcon} />
                <View style={styles.textInputWrapper}>
                    <Text style={[styles.selectorPlaceholderText, value ? styles.selectorValueText : null]} numberOfLines={1}>
                        {value ? `Selected (${selectedItems.length}/${maxSelect}) items` : placeholder}
                    </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color="#6B7280" />
            </TouchableOpacity>

            {/* Dropdown Overlay Screen */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleClose}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalTopDismiss}
                        activeOpacity={1}
                        onPress={handleClose}
                    />

                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {label} (Max {maxSelect})</Text>
                            <TouchableOpacity onPress={handleClose}>
                                <Ionicons name="close" size={24} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalSearchContainer}>
                            <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.modalSearchInput}
                                placeholder="Search options..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <FlatList
                            data={filteredOptions}
                            keyExtractor={(item) => item}
                            initialNumToRender={15}
                            maxToRenderPerBatch={20}
                            windowSize={10}
                            getItemLayout={(_, index) => ({ length: 50, offset: 50 * index, index })}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            renderItem={({ item }) => {
                                const isSelected = selectedItems.includes(item);
                                return (
                                    <TouchableOpacity
                                        style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                                        onPress={() => toggleItem(item)}
                                    >
                                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                            {item}
                                        </Text>
                                        {isSelected && <Ionicons name="checkmark-circle" size={20} color="#16A34A" />}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No matching items found.</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
});

// Reusable Input Component
const ProfileInputField = React.memo(({
    label,
    value,
    onChangeText,
    icon,
    placeholder,
    keyboardType = 'default',
    editable = true
}: FieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, isFocused && styles.labelFocused]}>{label}</Text>
            <View style={[
                styles.inputContainer,
                isFocused && styles.containerFocused,
                !editable && { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }
            ]}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={isFocused ? '#16A34A' : '#9CA3AF'}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={[styles.textInput, !editable && { color: '#9CA3AF' }]}
                    value={value || ''}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={keyboardType}
                    editable={editable}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </View>
        </View>
    );
});

// Image Gallery Component with Upload and Delete
const ImageGallerySection = React.memo(({
    title,
    images,
    onAddImage,
    onDeleteImage,
    onImagePress,
    emptyMessage = "No documents uploaded",
    uploading = false
}: {
    title: string;
    images: { uri: string; fileName?: string }[];
    onAddImage: () => void;
    onDeleteImage: (index: number) => void;
    onImagePress: (index: number) => void;
    emptyMessage?: string;
    uploading?: boolean;
}) => {
    return (
        <View style={styles.row}>
            <View style={styles.galleryHeader}>
                <Text style={styles.label}>{title}</Text>
                <TouchableOpacity
                    style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                    onPress={onAddImage}
                    disabled={uploading}
                    activeOpacity={0.8}
                >
                    {uploading ? (
                        <ActivityIndicator size="small" color="#16A34A" />
                    ) : (
                        <>
                            <Ionicons name="cloud-upload-outline" size={20} color="#16A34A" />
                            <Text style={styles.uploadButtonText}>Upload</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {images.length > 0 ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.galleryContainer}
                >
                    {images.map((item, index) => (
                        <View key={`img-${index}`} style={styles.galleryItemWrapper}>
                            <TouchableOpacity
                                onPress={() => onImagePress(index)}
                                activeOpacity={0.7}
                                style={styles.galleryImageTouch}
                            >
                                <Image
                                    source={{ uri: item.uri }}
                                    style={styles.galleryImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.imageOverlay}>
                                    <Ionicons name="expand-outline" size={20} color="#FFF" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteImageButton}
                                onPress={() => onDeleteImage(index)}
                                disabled={uploading}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close-circle" size={24} color={uploading ? "#D1D5DB" : "#EF4444"} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.emptyGalleryContainer}>
                    <Ionicons name="document-outline" size={40} color="#D1D5DB" />
                    <Text style={styles.emptyGalleryText}>{emptyMessage}</Text>
                    <Text style={styles.emptyGallerySubText}>Tap "Upload" to add documents</Text>
                </View>
            )}
        </View>
    );
});

export default function ModernUpdateProfile() {
    const {
        fetching = false,
        loading = false,
        idUin,
        fullName = '',
        setFullName,
        phone = '',
        email = '',
        setEmail,
        preferredWorkingArea = '',
        setPreferredWorkingArea,
        areaOfExpertise = '',
        setAreaOfExpertise,
        emergencyContact = '',
        setEmergencyContact,
        saveProfile,
        resetProfile,
        idProof,
        resumeCv,
        setIdProof,
        setResumeCv
    } = useWorkforceProfile();

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [checkingPending, setCheckingPending] = useState(false);

    // Local state for images
    const [localIdProof, setLocalIdProof] = useState<{ uri: string; fileName?: string }[]>([]);
    const [localResumeCv, setLocalResumeCv] = useState<{ uri: string; fileName?: string }[]>([]);

    // Initialize local state from props
    useEffect(() => {
        if (idProof && idProof.length > 0) {
            setLocalIdProof(idProof.map(url => ({ uri: url })));
        }
    }, [idProof]);

    useEffect(() => {
        if (resumeCv && resumeCv.length > 0) {
            setLocalResumeCv(resumeCv.map(url => ({ uri: url })));
        }
    }, [resumeCv]);

    // Reset profile image when form resets
    useEffect(() => {
        if (!fullName) {
            setProfileImage(null);
        }
    }, [fullName]);

    // Lightbox State Management
    const [viewerVisible, setViewerVisible] = useState(false);
    const [activeImages, setActiveImages] = useState<{ uri: string; fileName?: string }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (images: { uri: string; fileName?: string }[], index: number) => {
        setActiveImages(images);
        setCurrentIndex(index);
        setViewerVisible(true);
    };

    const nextImage = () => {
        if (currentIndex < activeImages.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevImage = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const getInitials = () => {
        const cleanName = (fullName || '').trim();
        if (!cleanName) return "US";
        const words = cleanName.split(/\s+/);
        return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : words[0].slice(0, 2).toUpperCase();
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission Denied", "You need to allow access to your photos to upload a profile picture.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleChangeSecurityDetails = () => {
        router.push('/(drawer)/AdminChangePassword');
    };

    // Check for existing pending update
    const checkForPendingUpdate = async (uin: string): Promise<boolean> => {
        if (!uin) return false;

        try {
            setCheckingPending(true);

            const { data, error } = await supabase
                .from('workforce_update_profile')
                .select('id_uin, status')
                .eq('id_uin', uin)
                .eq('status', 'Pending')
                .maybeSingle();

            // If there's an error that's not "no rows found"
            if (error && error.code !== 'PGRST116') {
                console.error('Error checking pending update:', error);
                return false;
            }

            // If data exists, there's a pending update
            return !!data;
        } catch (error) {
            console.error('Error checking pending update:', error);
            return false;
        } finally {
            setCheckingPending(false);
        }
    };

    // Updated handleDocumentPick - stores locally only
    const handleDocumentPick = async (type: 'id' | 'resume') => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission Denied", "You need to allow access to your photos to upload documents.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            const fileName = result.assets[0].fileName || `image_${Date.now()}.jpg`;

            if (type === 'id') {
                setLocalIdProof(prev => [...prev, { uri, fileName }]);
            } else {
                setLocalResumeCv(prev => [...prev, { uri, fileName }]);
            }
        }
    };

    // Updated handleDeleteImage - works with local state
    const handleDeleteImage = (type: 'id' | 'resume', index: number) => {
        Alert.alert(
            "Delete Document",
            "Are you sure you want to remove this document?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        if (type === 'id') {
                            const newProof = [...localIdProof];
                            newProof.splice(index, 1);
                            setLocalIdProof(newProof);
                        } else {
                            const newResume = [...localResumeCv];
                            newResume.splice(index, 1);
                            setLocalResumeCv(newResume);
                        }
                    }
                }
            ]
        );
    };

    // Updated handleSave - checks for pending updates first
    // Updated handleSave - checks for pending updates first
    const handleSave = async () => {
        if (!fullName.trim() || !phone.trim() || !email.trim()) {
            Alert.alert("Error", "Name, Phone, and Email are strictly required.");
            return;
        }

        // Check if there's already a pending update for this UIN
        if (idUin) {
            const hasPending = await checkForPendingUpdate(idUin);

            if (hasPending) {
                Alert.alert(
                    "Pending Update Exists",
                    `A pending update request for UIN: ${idUin} is already in the system. You cannot submit another update until the current one is processed.`,
                    [{ text: "OK", style: "default" }]
                );
                return;
            }
        }

        setIsSaving(true);

        try {
            // Upload all ID proof images
            const uploadedIdProofs: string[] = [];
            let hasUploadError = false;

            for (const item of localIdProof) {
                // Skip if it's already a URL (existing image)
                if (item.uri.startsWith('http')) {
                    uploadedIdProofs.push(item.uri);
                } else {
                    // Upload new image
                    try {
                        const publicUrl = await uploadWorkforceDocument(
                            { uri: item.uri },
                            phone,
                            'id_proof'
                        );
                        uploadedIdProofs.push(publicUrl);
                    } catch (error: any) {
                        hasUploadError = true;
                        Alert.alert("Upload Failed", `Failed to upload ID document: ${error.message}`);
                        break;
                    }
                }
            }

            if (hasUploadError) {
                setIsSaving(false);
                return;
            }

            // Upload all Resume/CV images
            const uploadedResumeCv: string[] = [];
            for (const item of localResumeCv) {
                if (item.uri.startsWith('http')) {
                    uploadedResumeCv.push(item.uri);
                } else {
                    try {
                        const publicUrl = await uploadWorkforceDocument(
                            { uri: item.uri },
                            phone,
                            'resume_cv'
                        );
                        uploadedResumeCv.push(publicUrl);
                    } catch (error: any) {
                        hasUploadError = true;
                        Alert.alert("Upload Failed", `Failed to upload resume document: ${error.message}`);
                        break;
                    }
                }
            }

            if (hasUploadError) {
                setIsSaving(false);
                return;
            }

            // Update the state with uploaded URLs
            setIdProof(uploadedIdProofs);
            setResumeCv(uploadedResumeCv);

            // Now save the profile
            await saveProfile?.(() => {
                // Update local state with uploaded URLs
                setLocalIdProof(uploadedIdProofs.map(url => ({ uri: url })));
                setLocalResumeCv(uploadedResumeCv.map(url => ({ uri: url })));

                // Show success message before navigating
                Alert.alert(
                    "Success",
                    "Profile updated successfully! You can now view your updated profile.",
                    [
                        {
                            text: "View Profile",
                            onPress: () => {
                                router.push({
                                    pathname: '/admin/ViewUpdatedProfile',
                                    params: { uin: idUin }
                                });
                            }
                        },
                        { text: "Go to Home", onPress: () => router.push('/Home') }
                    ]
                );
            });

        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to save profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleViewUpdatedProfile = async () => {
        // Check if there's a UIN
        if (!idUin) {
            Alert.alert(
                "No Profile Found",
                "No profile data found. Please save your profile first before viewing.",
                [{ text: "OK", style: "default" }]
            );
            return;
        }

        try {
            // First, check if there's any data in the workforce_update_profile table with this UIN
            const { data, error } = await supabase
                .from('workforce_update_profile')
                .select('id_uin, status')
                .eq('id_uin', idUin)
                .maybeSingle();

            if (error) {
                console.error('Error checking for profile updates:', error);
                Alert.alert(
                    "Error",
                    "Unable to check for profile updates. Please try again later.",
                    [{ text: "OK", style: "default" }]
                );
                return;
            }

            // If no data exists, the user hasn't made any changes yet
            if (!data) {
                Alert.alert(
                    "No Changes Made",
                    "You haven't made any profile changes yet. Please make some changes and save them before viewing the updated profile.",
                    [{ text: "OK", style: "default" }]
                );
                return;
            }

            // If data exists but status is not 'Pending' or 'Approved', inform the user
            if (data.status !== 'Pending' && data.status !== 'Approved') {
                Alert.alert(
                    "No Active Updates",
                    `Your profile update status is "${data.status}". Only pending or approved updates can be viewed.`,
                    [{ text: "OK", style: "default" }]
                );
                return;
            }

            // If everything is fine, navigate to the view page
            router.push({
                pathname: '/admin/ViewUpdatedProfile',
                params: { uin: idUin }
            });

        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert(
                "Navigation Error",
                "Unable to navigate to the updated profile page. Please try again later.",
                [{ text: "OK", style: "default" }]
            );
        }
    };

    // Reset handler with confirmation
    const handleReset = () => {
        setShowResetConfirm(true);
    };

    const confirmReset = async () => {
        setIsResetting(true);
        setShowResetConfirm(false);

        try {
            // Reset all form data using the hook's reset function
            resetProfile?.();

            // Reset local image states to original values
            setLocalIdProof(idProof.map(url => ({ uri: url })) || []);
            setLocalResumeCv(resumeCv.map(url => ({ uri: url })) || []);
            setProfileImage(null);

            // Show success message
            Alert.alert("Reset Complete", "Profile form has been reset to original values.");

            // Reload the page by replacing the current route with itself
            router.replace('/admin/UpdateProfile');

        } catch (error) {
            Alert.alert("Error", "Failed to reset profile. Please try again.");
        } finally {
            setIsResetting(false);
        }
    };

    const handleEmergencyContactChange = useCallback((v: string) => {
        setEmergencyContact?.(v.replace(/[^0-9]/g, '').slice(0, 10));
    }, [setEmergencyContact]);

    // Show loading overlay during reset
    if (isResetting) {
        return (
            <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={{ marginTop: 12, color: '#6B7280', fontWeight: '500' }}>Resetting profile...</Text>
            </View>
        );
    }

    if (fetching) {
        return (
            <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={{ marginTop: 12, color: '#6B7280', fontWeight: '500' }}>Syncing profile nodes...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.mainContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <StatusBar style="dark" />
            <Header4 />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <Text style={styles.headerSubtitle}>Admin Control Panel</Text>
                </View>

                {/* Profile Badge Card */}
                <View style={styles.profileBadgeCard}>
                    <TouchableOpacity
                        style={styles.avatarPickerContainer}
                        onPress={pickImage}
                        disabled={isSaving || loading || isResetting || checkingPending}
                        activeOpacity={0.85}
                    >
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{getInitials()}</Text>
                            </View>
                        )}
                        <View style={styles.cameraIconBadge}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.badgeName}>{fullName || "Workforce User"}</Text>

                    {phone ? (
                        <View style={styles.phoneBadgeRow}>
                            <Ionicons name="call-outline" size={14} color="#6B7280" />
                            <Text style={styles.badgePhoneText}>{phone}</Text>
                        </View>
                    ) : null}

                    {idUin ? (
                        <View style={[styles.phoneBadgeRow, { marginTop: 4 }]}>
                            <Ionicons name="finger-print-outline" size={14} color="#6B7280" />
                            <Text style={styles.badgePhoneText}>UIN: {idUin}</Text>
                        </View>
                    ) : null}
                </View>

                <Text style={styles.sectionHeading}>Personal Information</Text>
                <View style={styles.card}>
                    <ProfileInputField
                        label="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                        icon="person-outline"
                        placeholder="John Doe"
                        editable={!isSaving && !loading && !isResetting && !checkingPending}
                    />
                    <ProfileInputField
                        label="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        icon="mail-outline"
                        placeholder="admin@domain.com"
                        keyboardType="email-address"
                        editable={!isSaving && !loading && !isResetting && !checkingPending}
                    />
                    <ProfileInputField
                        label="Emergency Contact"
                        value={emergencyContact}
                        onChangeText={handleEmergencyContactChange}
                        icon="alert-circle-outline"
                        placeholder="Emergency phone number"
                        keyboardType="number-pad"
                        editable={!isSaving && !loading && !isResetting && !checkingPending}
                    />
                </View>

                <Text style={styles.sectionHeading}>Work & Capabilities</Text>
                <View style={styles.card}>
                    <ProfileDropdownArrayList
                        label="Area of Expertise"
                        value={areaOfExpertise}
                        onChangeText={setAreaOfExpertise}
                        icon="construct-outline"
                        placeholder="Select Expertise Services"
                        options={services}
                        maxSelect={3}
                    />

                    <ProfileDropdownArrayList
                        label="Preferred Working Area"
                        value={preferredWorkingArea}
                        onChangeText={setPreferredWorkingArea}
                        icon="location-outline"
                        placeholder="Select Working Areas"
                        options={area}
                        maxSelect={5}
                    />
                </View>

                <Text style={styles.sectionHeading}>Security</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.securityButtonRow}
                        onPress={handleChangeSecurityDetails}
                        disabled={isSaving || loading || isResetting || checkingPending}
                        activeOpacity={0.7}
                    >
                        <View style={styles.securityLeftContent}>
                            <Ionicons name="lock-closed-outline" size={20} color="#EF4444" style={styles.inputIcon} />
                            <Text style={styles.securityButtonText}>Change PIN / Password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* ID / Proof Gallery Component Section */}
                <ImageGallerySection
                    title="ID / Proof Documents"
                    images={localIdProof}
                    onAddImage={() => handleDocumentPick('id')}
                    onDeleteImage={(index) => handleDeleteImage('id', index)}
                    onImagePress={(index) => openLightbox(localIdProof, index)}
                    emptyMessage="No ID documents uploaded"
                    uploading={isSaving || loading || isResetting || checkingPending}
                />

                {/* Resume / CV Gallery Component Section */}
                <ImageGallerySection
                    title="Resume / CV Documents"
                    images={localResumeCv}
                    onAddImage={() => handleDocumentPick('resume')}
                    onDeleteImage={(index) => handleDeleteImage('resume', index)}
                    onImagePress={(index) => openLightbox(localResumeCv, index)}
                    emptyMessage="No resume documents uploaded"
                    uploading={isSaving || loading || isResetting || checkingPending}
                />

                {/* View Updated Profile Button */}
                <TouchableOpacity
                    style={[styles.viewProfileButton, (isSaving || loading || isResetting || checkingPending) && styles.buttonDisabled]}
                    onPress={handleViewUpdatedProfile}
                    disabled={isSaving || loading || isResetting || checkingPending}
                    activeOpacity={0.8}
                >
                    <Ionicons name="eye-outline" size={22} color="#16A34A" />
                    <Text style={styles.viewProfileButtonText}>View Updated Profile</Text>
                </TouchableOpacity>

                {/* Action Buttons Row */}
                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.resetButton]}
                        onPress={handleReset}
                        disabled={isSaving || loading || isResetting || checkingPending}
                        activeOpacity={0.8}
                    >
                        {isResetting ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <>
                                <Ionicons name="refresh-outline" size={20} color="#EF4444" />
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton, (isSaving || loading || isResetting || checkingPending) && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={isSaving || loading || isResetting || checkingPending}
                        activeOpacity={0.8}
                    >
                        {isSaving || loading || checkingPending ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Status Message for Pending Updates */}
                {idUin && (
                    <View style={styles.statusInfoContainer}>
                        <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
                        <Text style={styles.statusInfoText}>
                            UIN: {idUin} - {checkingPending ? 'Checking for pending updates...' : 'Ready for update'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Reset Confirmation Modal */}
            <Modal
                visible={showResetConfirm}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowResetConfirm(false)}
            >
                <View style={styles.confirmModalOverlay}>
                    <View style={styles.confirmModalContent}>
                        <View style={styles.confirmModalIcon}>
                            <Ionicons name="warning-outline" size={48} color="#EF4444" />
                        </View>
                        <Text style={styles.confirmModalTitle}>Reset Form?</Text>
                        <Text style={styles.confirmModalMessage}>
                            This will discard all unsaved changes and restore the form to its original values.
                        </Text>
                        <View style={styles.confirmModalButtons}>
                            <TouchableOpacity
                                style={[styles.confirmModalButton, styles.confirmCancelButton]}
                                onPress={() => setShowResetConfirm(false)}
                                disabled={isSaving || loading || isResetting || checkingPending}
                            >
                                <Text style={styles.confirmCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmModalButton, styles.confirmResetButton]}
                                onPress={confirmReset}
                                disabled={isSaving || loading || isResetting || checkingPending}
                            >
                                <Text style={styles.confirmResetButtonText}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- LIGHTBOX VIEWER OVERLAY --- */}
            <Modal
                visible={viewerVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewerVisible(false)}
            >
                <View style={styles.viewerContainer}>
                    {/* Top Dismiss Action Header */}
                    <View style={styles.viewerHeader}>
                        <Text style={styles.viewerIndexText}>
                            {activeImages.length > 0 ? `${currentIndex + 1} / ${activeImages.length}` : ''}
                        </Text>
                        <TouchableOpacity style={styles.viewerCloseBtn} onPress={() => setViewerVisible(false)}>
                            <Ionicons name="close" size={28} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Main Viewer Body with Navigation */}
                    <View style={styles.viewerMainBody}>
                        {/* Prev Button `<` */}
                        {activeImages.length > 1 && (
                            <TouchableOpacity
                                style={[styles.navBtn, styles.navLeft, currentIndex === 0 && { opacity: 0.3 }]}
                                onPress={prevImage}
                                disabled={currentIndex === 0}
                            >
                                <Ionicons name="chevron-back" size={32} color="#FFF" />
                            </TouchableOpacity>
                        )}

                        {/* Image Viewer Target */}
                        {activeImages.length > 0 && (
                            <Image
                                source={{ uri: activeImages[currentIndex].uri }}
                                style={styles.fullViewerImage}
                                resizeMode="contain"
                            />
                        )}

                        {/* Next Button `>` */}
                        {activeImages.length > 1 && (
                            <TouchableOpacity
                                style={[styles.navBtn, styles.navRight, currentIndex === activeImages.length - 1 && { opacity: 0.3 }]}
                                onPress={nextImage}
                                disabled={currentIndex === activeImages.length - 1}
                            >
                                <Ionicons name="chevron-forward" size={32} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F9FAFB' },
    headerTitleContainer: { alignItems: 'center', paddingBottom: 20 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
    headerSubtitle: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    scrollContent: { padding: 20, paddingBottom: 80 },
    profileBadgeCard: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, paddingVertical: 24, paddingHorizontal: 20, marginBottom: 25, borderWidth: 1, borderColor: '#E5E7EB', elevation: 2 },

    avatarPickerContainer: { position: 'relative', marginBottom: 14, alignItems: 'center' },
    avatarImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#16A34A' },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#A5D6A7' },
    cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#16A34A', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', elevation: 3 },

    avatarText: { fontSize: 26, fontWeight: '800', color: '#2E7D32', letterSpacing: 0.5 },
    badgeName: { fontSize: 19, fontWeight: '700', color: '#1F2937', marginBottom: 6 },

    phoneBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, backgroundColor: '#F3F4F6', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
    badgePhoneText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },

    sectionHeading: { fontSize: 14, fontWeight: '700', color: '#4B5563', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginLeft: 4 },
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 25, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
    inputWrapper: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6, marginLeft: 2 },
    limitHint: { fontSize: 11, color: '#9CA3AF', fontWeight: '400' },
    labelFocused: { color: '#16A34A' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, height: 50, backgroundColor: '#F9FAFB', paddingHorizontal: 14 },
    containerFocused: { borderColor: '#16A34A', backgroundColor: '#FFF' },
    inputIcon: { marginRight: 10 },
    textInputWrapper: { flex: 1, justifyContent: 'center' },
    textInput: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1F2937' },
    selectorPlaceholderText: { fontSize: 15, fontWeight: '500', color: '#9CA3AF' },
    selectorValueText: { color: '#1F2937' },
    arrayBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
    chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#A5D6A7' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#2E7D32' },
    chipCloseButton: { marginLeft: 6, justifyContent: 'center', alignItems: 'center' },

    securityButtonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
    securityLeftContent: { flexDirection: 'row', alignItems: 'center' },
    securityButtonText: { fontSize: 15, fontWeight: '600', color: '#1F2937' },

    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 5,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        height: 54,
        gap: 8,
    },
    saveButton: {
        backgroundColor: '#16A34A',
        flex: 2,
    },
    resetButton: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1.5,
        borderColor: '#FCA5A5',
        flex: 1,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
    buttonDisabled: {
        opacity: 0.6,
    },

    // View Profile Button
    viewProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0FDF4',
        borderWidth: 1.5,
        borderColor: '#86EFAC',
        borderRadius: 16,
        height: 50,
        marginBottom: 16,
        gap: 10,
    },
    viewProfileButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#16A34A',
    },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalTopDismiss: { height: '20%' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, height: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    modalSearchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, height: 44, marginTop: 15, marginBottom: 10 },
    modalSearchInput: { flex: 1, fontSize: 14, color: '#1F2937' },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 50, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    optionRowSelected: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, borderRadius: 8 },
    optionText: { fontSize: 15, color: '#4B5563', fontWeight: '500' },
    optionTextSelected: { color: '#16A34A', fontWeight: '600' },
    emptyText: { textAlign: 'center', color: '#9CA3AF', marginVertical: 30, fontSize: 14 },

    // Gallery Styles
    row: {
        marginBottom: 24,
        paddingHorizontal: 4,
        width: '100%',
    },
    galleryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#86EFAC',
        gap: 6,
    },
    uploadButtonDisabled: {
        opacity: 0.6,
    },
    uploadButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#16A34A',
    },
    galleryContainer: {
        flexDirection: 'row',
        paddingVertical: 4,
        gap: 12,
    },
    galleryItemWrapper: {
        position: 'relative',
        marginRight: 4,
    },
    galleryImageTouch: {
        width: 100,
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
    },
    deleteImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFF',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    emptyGalleryContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        minHeight: 120,
    },
    emptyGalleryText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
        marginTop: 8,
    },
    emptyGallerySubText: {
        fontSize: 12,
        color: '#D1D5DB',
        marginTop: 4,
    },

    /* Lightbox Viewer Styles */
    viewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
    },
    viewerHeader: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    viewerIndexText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    viewerCloseBtn: {
        padding: 6,
    },
    viewerMainBody: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    fullViewerImage: {
        width: SCREEN_WIDTH - 40,
        height: '75%',
    },
    navBtn: {
        position: 'absolute',
        top: '50%',
        marginTop: -25,
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 15,
    },
    navLeft: {
        left: 10,
    },
    navRight: {
        right: 10,
    },

    // Reset Confirmation Modal Styles
    confirmModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmModalContent: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        width: '85%',
        maxWidth: 340,
        alignItems: 'center',
    },
    confirmModalIcon: {
        marginBottom: 16,
    },
    confirmModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    confirmModalMessage: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    confirmModalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    confirmModalButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmCancelButton: {
        backgroundColor: '#F3F4F6',
    },
    confirmResetButton: {
        backgroundColor: '#EF4444',
    },
    confirmCancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    confirmResetButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },

    // Status Info
    statusInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        gap: 6,
    },
    statusInfoText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
});