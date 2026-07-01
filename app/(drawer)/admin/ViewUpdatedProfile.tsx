import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Image,
    Dimensions,
    TouchableOpacity,
    Alert,
    Modal,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/src/lib/supabase';
import Header4 from '@/components/Header4Admin';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UpdateProfileData {
    id: string;
    id_uin: string;
    full_name: string;
    email: string;
    phone: string;
    area_of_expertise: string[] | string;
    preferred_working_area: string[] | string;
    emergency_contact_number: string;
    id_proof: string[];
    resume_cv: string[];
    status: string;
    created_at: string;
    updated_at: string;
}

export default function ViewUpdatedProfile() {
    const params = useLocalSearchParams();
    const uin = params.uin as string;
    
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<UpdateProfileData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Lightbox State
    const [viewerVisible, setViewerVisible] = useState(false);
    const [activeImages, setActiveImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (uin) {
            fetchProfileData();
        } else {
            setError("No profile ID provided");
            setLoading(false);
        }
    }, [uin]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('workforce_update_profile')
                .select('*')
                .eq('id_uin', uin)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            if (!data) {
                setError("No profile update found");
                return;
            }

            setProfileData(data);
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError(err.message || "Failed to load profile data");
            Alert.alert("Error", "Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const openLightbox = (images: string[], index: number) => {
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

    const handleBack = () => {
        router.back();
    };

    const getInitials = (name: string) => {
        const cleanName = (name || '').trim();
        if (!cleanName) return "US";
        const words = cleanName.split(/\s+/);
        return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : words[0].slice(0, 2).toUpperCase();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderStatusBadge = (status: string) => {
        const statusColors: { [key: string]: { bg: string; text: string } } = {
            'Pending': { bg: '#FEF3C7', text: '#D97706' },
            'Approved': { bg: '#D1FAE5', text: '#059669' },
            'Rejected': { bg: '#FEE2E2', text: '#DC2626' },
            'Completed': { bg: '#DBEAFE', text: '#2563EB' },
        };

        const colors = statusColors[status] || { bg: '#F3F4F6', text: '#6B7280' };

        return (
            <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
            </View>
        );
    };

    const renderGallery = (images: string[], title: string) => {
        if (!images || images.length === 0) {
            return (
                <View style={styles.emptyGalleryContainer}>
                    <Ionicons name="document-outline" size={32} color="#D1D5DB" />
                    <Text style={styles.emptyGalleryText}>No {title.toLowerCase()} uploaded</Text>
                </View>
            );
        }

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryContainer}
            >
                {images.map((url, index) => (
                    <TouchableOpacity
                        key={`img-${index}`}
                        onPress={() => openLightbox(images, index)}
                        activeOpacity={0.7}
                        style={styles.galleryImageTouch}
                    >
                        <Image
                            source={{ uri: url }}
                            style={styles.galleryImage}
                            resizeMode="cover"
                        />
                        <View style={styles.imageOverlay}>
                            <Ionicons name="expand-outline" size={20} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    const parseArray = (value: string[] | string) => {
        if (Array.isArray(value)) {
            return value;
        }
        if (typeof value === 'string') {
            return value.split(',').map(item => item.trim()).filter(Boolean);
        }
        return [];
    };

    if (loading) {
        return (
            <View style={[styles.mainContainer, styles.centerContainer]}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={styles.loadingText}>Loading profile data...</Text>
            </View>
        );
    }

    if (error || !profileData) {
        return (
            <View style={[styles.mainContainer, styles.centerContainer]}>
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text style={styles.errorText}>{error || "Profile not found"}</Text>
                <TouchableOpacity style={styles.backButtonError} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={20} color="#FFF" />
                    <Text style={styles.backButtonErrorText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const expertiseArray = parseArray(profileData.area_of_expertise);
    const workingAreaArray = parseArray(profileData.preferred_working_area);

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="dark" />
            <Header4 />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with Back Button */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Updated Profile</Text>
                    <View style={styles.headerPlaceholder} />
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{getInitials(profileData.full_name)}</Text>
                        </View>
                    </View>
                    <Text style={styles.profileName}>{profileData.full_name}</Text>
                    <Text style={styles.profileEmail}>{profileData.email}</Text>
                    {profileData.phone && (
                        <View style={styles.phoneRow}>
                            <Ionicons name="call-outline" size={16} color="#6B7280" />
                            <Text style={styles.phoneText}>{profileData.phone}</Text>
                        </View>
                    )}
                    {renderStatusBadge(profileData.status)}
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.card}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Full Name</Text>
                            <Text style={styles.infoValue}>{profileData.full_name}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{profileData.email}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{profileData.phone || 'N/A'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Emergency Contact</Text>
                            <Text style={styles.infoValue}>{profileData.emergency_contact_number || 'N/A'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>ID (UIN)</Text>
                            <Text style={styles.infoValue}>{profileData.id_uin || 'N/A'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Submitted</Text>
                            <Text style={styles.infoValue}>{formatDate(profileData.created_at)}</Text>
                        </View>
                    </View>
                </View>

                {/* Work & Capabilities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Work & Capabilities</Text>
                    <View style={styles.card}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Area of Expertise</Text>
                            <View style={styles.tagContainer}>
                                {expertiseArray.length > 0 ? (
                                    expertiseArray.map((item, index) => (
                                        <View key={index} style={styles.tag}>
                                            <Text style={styles.tagText}>{item}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noDataText}>No expertise specified</Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Preferred Working Area</Text>
                            <View style={styles.tagContainer}>
                                {workingAreaArray.length > 0 ? (
                                    workingAreaArray.map((item, index) => (
                                        <View key={index} style={styles.tag}>
                                            <Text style={styles.tagText}>{item}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noDataText}>No working areas specified</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Documents */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Documents</Text>
                    <View style={styles.card}>
                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>ID / Proof Documents</Text>
                            {renderGallery(profileData.id_proof || [], 'ID documents')}
                        </View>
                        <View style={styles.documentDivider} />
                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>Resume / CV Documents</Text>
                            {renderGallery(profileData.resume_cv || [], 'Resume documents')}
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity style={styles.backToEditButton} onPress={handleBack}>
                    <Ionicons name="arrow-back-circle-outline" size={22} color="#FFF" />
                    <Text style={styles.backToEditButtonText}>Back to Edit</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Lightbox Modal */}
            <Modal
                visible={viewerVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewerVisible(false)}
            >
                <View style={styles.viewerContainer}>
                    <View style={styles.viewerHeader}>
                        <Text style={styles.viewerIndexText}>
                            {activeImages.length > 0 ? `${currentIndex + 1} / ${activeImages.length}` : ''}
                        </Text>
                        <TouchableOpacity style={styles.viewerCloseBtn} onPress={() => setViewerVisible(false)}>
                            <Ionicons name="close" size={28} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.viewerMainBody}>
                        {activeImages.length > 1 && (
                            <TouchableOpacity
                                style={[styles.navBtn, styles.navLeft, currentIndex === 0 && { opacity: 0.3 }]}
                                onPress={prevImage}
                                disabled={currentIndex === 0}
                            >
                                <Ionicons name="chevron-back" size={32} color="#FFF" />
                            </TouchableOpacity>
                        )}

                        {activeImages.length > 0 && (
                            <Image
                                source={{ uri: activeImages[currentIndex] }}
                                style={styles.fullViewerImage}
                                resizeMode="contain"
                            />
                        )}

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
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 80,
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontWeight: '500',
        fontSize: 16,
    },
    errorText: {
        marginTop: 12,
        color: '#EF4444',
        fontWeight: '500',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },

    // Header
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },
    backButtonError: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16A34A',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    backButtonErrorText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    headerPlaceholder: {
        width: 40,
    },

    // Profile Card
    profileCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2,
        marginBottom: 24,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#A5D6A7',
    },
    avatarText: {
        fontSize: 26,
        fontWeight: '800',
        color: '#2E7D32',
        letterSpacing: 0.5,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    phoneText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Sections
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4B5563',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 1,
    },
    infoRow: {
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 4,
    },

    // Tags
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    tag: {
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#A5D6A7',
    },
    tagText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#2E7D32',
    },
    noDataText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },

    // Documents
    documentSection: {
        marginBottom: 12,
    },
    documentLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
    },
    documentDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },

    // Gallery
    galleryContainer: {
        flexDirection: 'row',
        paddingVertical: 4,
        gap: 12,
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
    },
    emptyGalleryContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        minHeight: 80,
    },
    emptyGalleryText: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
        marginTop: 4,
    },

    // Back to Edit Button
    backToEditButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#16A34A',
        borderRadius: 16,
        height: 54,
        gap: 8,
        marginTop: 8,
    },
    backToEditButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },

    // Lightbox
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
});