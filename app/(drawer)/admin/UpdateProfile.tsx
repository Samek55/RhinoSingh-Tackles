import React, { useState, useMemo, useCallback } from 'react';
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

export default function ModernUpdateProfile() {
    const {
        fetching = false,
        loading = false,
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
        idProof,
        resumeCv,
        setIdProof,
        setResumeCv
    } = useWorkforceProfile();

    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Lightbox State Management
    const [viewerVisible, setViewerVisible] = useState(false);
    const [activeImages, setActiveImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Change the logic to expect strings, not objects with .url
    const openLightbox = (images: { url: string }[], index: number) => {
        const urls = images.map(img => img.url);
        setActiveImages(urls);
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

    const handleSave = () => {
        saveProfile?.(() => router.push('/Home'));
    };

    const handleEmergencyContactChange = useCallback((v: string) => {
        setEmergencyContact?.(v.replace(/[^0-9]/g, '').slice(0, 10));
    }, [setEmergencyContact]);

    // --- SIMPLIFIED ARRAY PARSING ---
    const idProofImages = useMemo(() => {
        // idProof is now string[] from the hook
        return (idProof || []).map(url => ({ url }));
    }, [idProof]);

    const resumeCVImages = useMemo(() => {
        // resumeCv is now string[] from the hook
        return (resumeCv || []).map(url => ({ url }));
    }, [resumeCv]);

    if (fetching) {
        return (
            <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={{ marginTop: 12, color: '#6B7280', fontWeight: '500' }}>Syncing profile nodes...</Text>
            </View>
        );
    }

    const handleDocumentPick = async (type: 'id' | 'resume') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images' as any,
            quality: 0.8,
        });

        if (!result.canceled && phone) {
            try {
                // Pass 'id_proof' or 'resume_cv' to the function
                const column = type === 'id' ? 'id_proof' : 'resume_cv';
                const publicUrl = await uploadWorkforceDocument(
                    { uri: result.assets[0].uri },
                    phone,
                    column
                );

                // Update UI state locally so the gallery refreshes immediately
                if (type === 'id') {
                    setIdProof(prev => [...prev, publicUrl]);
                } else {
                    setResumeCv(prev => [...prev, publicUrl]);
                }
            } catch (error: any) {
                Alert.alert("Upload Failed", error.message);
            }
        }
    };
    

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
                </View>

                <Text style={styles.sectionHeading}>Personal Information</Text>
                <View style={styles.card}>
                    <ProfileInputField label="Full Name" value={fullName} onChangeText={setFullName} icon="person-outline" placeholder="John Doe" />
                    <ProfileInputField label="Email Address" value={email} onChangeText={setEmail} icon="mail-outline" placeholder="admin@domain.com" keyboardType="email-address" />
                    <ProfileInputField label="Emergency Contact" value={emergencyContact} onChangeText={handleEmergencyContactChange} icon="alert-circle-outline" placeholder="Emergency phone number" keyboardType="number-pad" />
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
                <View style={styles.row}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.label}>ID / Proof Documents</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleDocumentPick('id')}
                        >
                            <Ionicons name="add-circle" size={24} color="#16A34A" />
                        </TouchableOpacity>
                    </View>
                    {idProofImages.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.carouselContainer}
                            style={styles.carouselWrapper}
                        >
                            {idProofImages.map((item, index) => (
                                <TouchableOpacity
                                    key={`id-${index}`}
                                    onPress={() => openLightbox(idProofImages, index)}
                                    activeOpacity={0.7}
                                    style={styles.thumbnailTouch}
                                >
                                    <Image
                                        source={{ uri: item?.url }}
                                        style={styles.thumbnailImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <Text style={styles.value}>No Documents Uploaded</Text>
                    )}
                </View>

                {/* Resume / CV Gallery Component Section */}
                <View style={styles.row}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.label}>Resume / CV Documents</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleDocumentPick('resume')}
                        >
                            <Ionicons name="add-circle" size={24} color="#16A34A" />
                        </TouchableOpacity>
                    </View>
                    {resumeCVImages.length > 0 ? (
                        <View style={styles.carouselWrapper}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
                                {resumeCVImages.map((item, index) => (
                                    <TouchableOpacity
                                        key={`res-${index}`}
                                        onPress={() => openLightbox(resumeCVImages, index)}
                                        activeOpacity={0.7}
                                        style={styles.thumbnailTouch}
                                    >
                                        <Image source={{ uri: item?.url }} style={styles.thumbnailImage} resizeMode="cover" />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    ) : (
                        <Text style={styles.value}>No Documents Uploaded</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <View style={styles.buttonInner}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                            <Ionicons name="arrow-forward-circle" size={20} color="#fff" />
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>

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
                                source={{ uri: activeImages[currentIndex] }}
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

    saveButton: { backgroundColor: '#16A34A', borderRadius: 16, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
    buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    saveButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

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

    row: {
        marginBottom: 20,
        paddingHorizontal: 4,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
    },
    value: {
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    carouselWrapper: {
        marginVertical: 8,
        height: 90,
    },
    carouselContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
    },
    thumbnailTouch: {
        width: 80,
        height: 80,
        marginRight: 10,
    },
    thumbnailImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#E5E7EB',
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
    addButton: {
        padding: 4,
        marginBottom: 8,
    },
});