import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Dimensions,
} from 'react-native';
import leftArrowIcon from '../../../assets/icons/admin/leftarrow.png';
import dropdownIcon from '../../../assets/icons/contact/DropDown.png';
import LocationPin from '../../../assets/icons/contact/location-pin.png';
import phoneIcon from '../../../assets/icons/admin/phone.png';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router, useLocalSearchParams } from 'expo-router';
import Header5 from '@/components/Header5Admin';
import { fetchWorkforceFromSupabase } from '@/api/supabase/fetchWorkforceSB';
import { useWorkforceUpdateProfile } from '@/api/hooks/superadmin/useWorkforceUpdateProfile';
import { updateWorkforceStatusSA } from '@/api/hooks/superadmin/updateWorkforceStatusSA';
import { useRequireRole } from '@/hooks/useRequireRole';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type StatusType = 'Accepted' | 'Pending' | 'Rejected' | 'Pending-Update';

export default function ProfessionalDetails() {
    const { authorized } = useRequireRole(['superadmin']);
    const scrollRef = useRef<ScrollView>(null);
    const lightboxScrollRef = useRef<ScrollView>(null);
    const { id } = useLocalSearchParams<{ id: string }>();

    const [applicant, setApplicant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [workStatus, setWorkStatus] = useState<StatusType>('Pending');

    // Lightbox State Management
    const [viewerVisible, setViewerVisible] = useState(false);
    const [activeImages, setActiveImages] = useState<string[]>([]);
    const [initialIndex, setInitialIndex] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    const STATUS_OPTIONS: StatusType[] = ['Accepted', 'Pending', 'Rejected', 'Pending-Update'];

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await fetchWorkforceFromSupabase();
                const safeData = Array.isArray(data) ? data : [];
                const found = safeData.find((item: any) => item && String(item.id) === String(id));

                if (found) {
                    setApplicant(found);
                    if (found.status) {
                        setWorkStatus(found.status as StatusType);
                    }
                } else {
                    setApplicant(null);
                }
            } catch (error) {
                console.error("Error fetching workforce details from Supabase:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    // Use the new hook to fetch pending update data
    const { updateData, loading: updateLoading, hasPendingUpdate } = useWorkforceUpdateProfile(
        applicant?.workforce_uin || applicant?.uin || ''
    );

    if (!authorized) {
        return null;
    }

    const handleStatusChange = (newStatus: StatusType) => {
        setWorkStatus(newStatus);
        setOpenDropdown(false);
    };

    const openLightbox = (images: string[], index: number) => {
        setActiveImages(images);
        setInitialIndex(index);
        setCurrentIndex(index);
        setViewerVisible(true);
    };

    const handlePrevImage = () => {
        if (currentIndex > 0) {
            const nextIdx = currentIndex - 1;
            setCurrentIndex(nextIdx);
            lightboxScrollRef.current?.scrollTo({ x: nextIdx * SCREEN_WIDTH, animated: true });
        }
    };

    const handleNextImage = () => {
        if (currentIndex < activeImages.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            lightboxScrollRef.current?.scrollTo({ x: nextIdx * SCREEN_WIDTH, animated: true });
        }
    };

    const handleScrollEnd = (e: any) => {
        const contentOffset = e.nativeEvent.contentOffset.x;
        const viewSize = e.nativeEvent.layoutMeasurement.width;
        const pageNum = Math.floor((contentOffset + 10) / viewSize);
        setCurrentIndex(pageNum);
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const trueDatabaseId = applicant?.workforce_uin || applicant?.uin || applicant?.id;
            if (!trueDatabaseId) {
                alert("Could not extract a valid identifier from the applicant object.");
                return;
            }

            // Call the updated API function
            const result = await updateWorkforceStatusSA(trueDatabaseId, workStatus);

            // Update local state
            setApplicant((prev: any) => ({ ...prev, status: workStatus }));

            // If status is Accepted or Rejected, also clear the pending update from local state
            if (workStatus === 'Accepted' || workStatus === 'Rejected') {
                // You might want to refetch the data or clear the pending update state
                // For example, you could refetch the applicant data
                const refreshedData = await fetchWorkforceFromSupabase();
                const found = refreshedData.find((item: any) =>
                    String(item.workforce_uin || item.uin || item.id) === String(trueDatabaseId)
                );
                if (found) {
                    setApplicant(found);
                }
            }

            alert(result.message || "Application status updated successfully!");
            router.replace('/admin/ProfessionalHistory');
        } catch (error) {
            console.error('Failed to update status:', error);
            alert("An error occurred while updating application status.");
        } finally {
            setSubmitting(false);
        }
    };

    const getParsedImages = (fieldData: any) => {
        return Array.isArray(fieldData) ? fieldData : [];
    };

    const idProofImages = getParsedImages(applicant?.idProof);
    const resumeCVImages = getParsedImages(applicant?.resumeCV);

    // Render a field comparison row
    const renderFieldRow = (label: string, originalValue: any, updatedValue: any) => {
        const originalStr = Array.isArray(originalValue) ? originalValue.join(', ') : String(originalValue || 'N/A');
        const updatedStr = Array.isArray(updatedValue) ? updatedValue.join(', ') : String(updatedValue || 'N/A');

        if (originalStr === updatedStr) return null;

        return (
            <View style={styles.updateRow}>
                <Text style={styles.updateLabel}>{label}</Text>
                <View style={styles.updateValuesContainer}>
                    <View style={styles.originalValueContainer}>
                        <Text style={styles.updateOriginalLabel}>Original:</Text>
                        <Text style={styles.updateOriginalValue}>{originalStr}</Text>
                    </View>
                    <View style={styles.updatedValueContainer}>
                        <Text style={styles.updateUpdatedLabel}>Updated:</Text>
                        <Text style={styles.updateUpdatedValue}>{updatedStr}</Text>
                    </View>
                </View>
            </View>
        );
    };

    // Render image comparison
    const renderImageComparison = (label: string, originalImages: string[], updatedImages: string[]) => {
        if (JSON.stringify(originalImages) === JSON.stringify(updatedImages)) return null;

        return (
            <View style={styles.updateRow}>
                <Text style={styles.updateLabel}>{label}</Text>
                <View style={styles.updateValuesContainer}>
                    <View style={styles.originalValueContainer}>
                        <Text style={styles.updateOriginalLabel}>Original:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.updateImageScroll}>
                            {originalImages.length > 0 ? (
                                originalImages.map((url, idx) => (
                                    <Image key={`orig-${idx}`} source={{ uri: url }} style={styles.updateThumbnail} resizeMode="cover" />
                                ))
                            ) : (
                                <Text style={styles.noImageText}>No images</Text>
                            )}
                        </ScrollView>
                    </View>
                    <View style={styles.updatedValueContainer}>
                        <Text style={styles.updateUpdatedLabel}>Updated:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.updateImageScroll}>
                            {updatedImages.length > 0 ? (
                                updatedImages.map((url, idx) => (
                                    <Image key={`upd-${idx}`} source={{ uri: url }} style={styles.updateThumbnail} resizeMode="cover" />
                                ))
                            ) : (
                                <Text style={styles.noImageText}>No images</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
            <Header5 />

            <View style={styles.topNavigationHeader}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Image source={leftArrowIcon} style={styles.backIcon} />
                    <Text style={styles.title}>
                        {applicant?.id ? `Application ID: # ${applicant.id}` : 'Applicant Details'}
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="green" />
                            <Text style={styles.loadingText}>Loading Profile...</Text>
                        </View>
                    ) : applicant ? (
                        <>
                            {/* Original Profile Card */}
                            <View style={[styles.card, { marginBottom: hp('2%') }]}>
                                <Text style={styles.heading}>{applicant?.fullName || 'N/A'}</Text>
                                <Text style={styles.labelMain}>
                                    <Image source={phoneIcon} style={{ width: 14, height: 11.5, tintColor: '#555' }} />
                                    {' '}{applicant?.phone || 'N/A'}
                                </Text>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <Text style={styles.value}>{applicant?.email || 'N/A'}</Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Position Applied For</Text>
                                    <Text style={styles.value}>
                                        {Array.isArray(applicant?.positionAppliedFor)
                                            ? applicant.positionAppliedFor.join(', ')
                                            : applicant?.positionAppliedFor || 'N/A'}
                                    </Text>
                                </View>

                                <View style={styles.rowLocation}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Years of Experience</Text>
                                        <Text style={styles.value}>{applicant?.yearsOfExperience ?? 'N/A'}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.label}>Current Status</Text>
                                        <Text style={[
                                            styles.value,
                                            applicant?.status?.toLowerCase().includes('accepted') && styles.completed,
                                            applicant?.status?.toLowerCase().includes('pending') && styles.pending,
                                            applicant?.status?.toLowerCase().includes('rejected') && styles.cancelled,
                                            applicant?.status?.toLowerCase().includes('pending-update') && styles.pendingUpdate,
                                        ]}>
                                            {applicant?.status || 'Pending'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.rowLocation}>
                                    <View style={styles.rowLocationInside}>
                                        <Text style={styles.label}>Preferred Working Area</Text>
                                        <Text style={styles.value}>
                                            {Array.isArray(applicant?.preferredWorkingArea)
                                                ? applicant.preferredWorkingArea.join(', ')
                                                : applicant?.preferredWorkingArea || 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={{ justifyContent: 'center' }}>
                                        <Image source={LocationPin} style={{ height: 26, width: 26, tintColor: 'green' }} />
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Area of Expertise</Text>
                                    <Text style={styles.value}>
                                        {Array.isArray(applicant?.areaOfExpertise)
                                            ? applicant.areaOfExpertise.join(', ')
                                            : applicant?.areaOfExpertise || 'N/A'}
                                    </Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Application Date</Text>
                                    <Text style={styles.value}>
                                        {applicant?.ApplicationDate ? new Date(applicant.ApplicationDate).toDateString() : 'N/A'}
                                    </Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Insurance Policy Number</Text>
                                    <Text style={styles.value}>{applicant.insurancePolicyNo || 'N/A'}</Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Emergency Contact Number</Text>
                                    <Text style={styles.value}>
                                        <Image source={phoneIcon} style={{ width: 14, height: 11.5, tintColor: '#555' }} />
                                        {' '}{applicant.emergencyContactNo || 'N/A'}</Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Cover Letter</Text>
                                    <Text style={styles.value}>{applicant.coverLetter || 'N/A'}</Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Message</Text>
                                    <Text style={styles.value}>{applicant.message || 'N/A'}</Text>
                                </View>

                                {/* ID / Proof Gallery */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
                                    {(idProofImages || []).map((url, index) => (
                                        <TouchableOpacity
                                            key={`id-${index}`}
                                            onPress={() => openLightbox(idProofImages || [], index)}
                                        >
                                            <Image source={{ uri: url }} style={styles.thumbnailImage} resizeMode="cover" />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Resume / CV Gallery */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
                                    {(resumeCVImages || []).map((url, index) => (
                                        <TouchableOpacity
                                            key={`res-${index}`}
                                            onPress={() => openLightbox(resumeCVImages || [], index)}
                                        >
                                            <Image source={{ uri: url }} style={styles.thumbnailImage} resizeMode="cover" />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Pending Update Changes Card */}
                            {hasPendingUpdate && updateData && applicant.status === 'Pending-Update' && (
                                <View style={[styles.card, styles.updateCard]}>
                                    <View style={styles.updateCardHeader}>
                                        <Text style={styles.updateCardTitle}>📝 Changed Professional Data</Text>
                                        <View style={styles.pendingBadge}>
                                            <Text style={styles.pendingBadgeText}>Pending Review</Text>
                                        </View>
                                    </View>

                                    {updateLoading ? (
                                        <ActivityIndicator size="small" color="green" />
                                    ) : (
                                        <>
                                            {renderFieldRow('Full Name', applicant?.fullName, updateData.full_name)}
                                            {renderFieldRow('Phone', applicant?.phone, updateData.phone)}
                                            {renderFieldRow('Email', applicant?.email, updateData.email)}
                                            {renderFieldRow('Area of Expertise', applicant?.areaOfExpertise, updateData.area_of_expertise)}
                                            {renderFieldRow('Preferred Working Area', applicant?.preferredWorkingArea, updateData.preferred_working_area)}
                                            {renderFieldRow('Emergency Contact', applicant?.emergencyContactNo || applicant?.emergency_contact_number, updateData.emergency_contact_number)}

                                            {renderImageComparison('ID Proof', idProofImages, updateData.id_proof)}
                                            {renderImageComparison('Resume/CV', resumeCVImages, updateData.resume_cv)}

                                            <Text style={styles.updateTimestamp}>
                                                Submitted: {updateData.created_at ? new Date(updateData.created_at).toLocaleString() : 'N/A'}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            )}

                            {/* Status Dropdown */}
                            <View style={[styles.card, { marginBottom: hp('10%') }]}>
                                <Text style={styles.statusLabel}>Change Application Status</Text>

                                <View style={[styles.dropdownWrapper, { zIndex: openDropdown ? 9999 : 1 }]}>
                                    <TouchableOpacity
                                        style={styles.dropdownBtn}
                                        onPress={() => {
                                            setOpenDropdown(!openDropdown);
                                            setTimeout(() => {
                                                scrollRef.current?.scrollToEnd({ animated: true });
                                            }, 100);
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={styles.dropdownTextContainer}>{workStatus}</Text>
                                            <Image source={dropdownIcon} style={{ height: 20, width: 23, tintColor: 'green' }} />
                                        </View>
                                    </TouchableOpacity>
                                    {openDropdown && (
                                        <View style={styles.dropdownMenu}>
                                            {STATUS_OPTIONS.map((item) => (
                                                <TouchableOpacity
                                                    key={item}
                                                    style={styles.dropdownItem}
                                                    onPress={() => handleStatusChange(item)}
                                                >
                                                    <Text style={styles.dropdownTextInside}>{item}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <View style={styles.ButtonContainer}>
                                    <TouchableOpacity
                                        style={[styles.AcceptButton, submitting && { backgroundColor: '#ccc' }]}
                                        onPress={handleSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.AcceptText}>Update Application</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>No profile information matches this ID.</Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* LIGHTBOX SLIDER & ZOOM MODAL */}
            <Modal visible={viewerVisible} transparent={true} animationType="fade" onRequestClose={() => setViewerVisible(false)}>
                <View style={styles.modalBackground}>
                    <TouchableOpacity style={styles.closeModalButton} onPress={() => setViewerVisible(false)}>
                        <Text style={styles.closeModalText}>✕ Close</Text>
                    </TouchableOpacity>

                    <View style={styles.viewerWrapper}>
                        {activeImages.length > 1 && currentIndex > 0 && (
                            <TouchableOpacity style={[styles.arrowButton, styles.leftArrow]} onPress={handlePrevImage}>
                                <Text style={styles.arrowText}>‹</Text>
                            </TouchableOpacity>
                        )}

                        <ScrollView
                            ref={lightboxScrollRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            contentOffset={{ x: initialIndex * SCREEN_WIDTH, y: 0 }}
                            onMomentumScrollEnd={handleScrollEnd}
                            style={{ width: SCREEN_WIDTH, flex: 1 }}
                        >
                            {activeImages.map((url, idx) => (
                                <ScrollView
                                    key={`zoom-${idx}`}
                                    maximumZoomScale={4}
                                    minimumZoomScale={1}
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.zoomContainer}
                                    style={{ width: SCREEN_WIDTH, flex: 1 }}
                                >
                                    <Image source={{ uri: url }} style={styles.fullscreenImage} resizeMode="contain" />
                                </ScrollView>
                            ))}
                        </ScrollView>

                        {activeImages.length > 1 && currentIndex < activeImages.length - 1 && (
                            <TouchableOpacity style={[styles.arrowButton, styles.rightArrow]} onPress={handleNextImage}>
                                <Text style={styles.arrowText}>›</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {activeImages.length > 1 && (
                        <Text style={styles.swipeIndicator}>
                            {currentIndex + 1} / {activeImages.length}
                        </Text>
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f7fb',
    },
    topNavigationHeader: {
        width: wp('100%'),
        backgroundColor: '#f6f7fb',
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.5%'),
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backIcon: {
        width: hp('3.5%'),
        height: hp('3.5%'),
        tintColor: 'green',
        marginRight: wp('2%'),
    },
    title: {
        fontSize: hp('2.3%'),
        fontWeight: '600',
        color: 'green',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: hp('5%'),
        paddingTop: hp('2%'),
    },
    card: {
        width: wp('90%'),
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingVertical: hp('2%'),
        paddingHorizontal: wp('5%'),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    updateCard: {
        borderWidth: 2,
        borderColor: '#FFA500',
        backgroundColor: '#FFF8F0',
        marginBottom: hp('2%'),
    },
    updateCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('1.5%'),
        paddingBottom: hp('1%'),
        borderBottomWidth: 1,
        borderBottomColor: '#FFE4B5',
    },
    updateCardTitle: {
        fontSize: hp('2.2%'),
        fontWeight: '700',
        color: '#D2691E',
    },
    pendingBadge: {
        backgroundColor: '#FFE4B5',
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('0.5%'),
        borderRadius: 12,
    },
    pendingBadgeText: {
        fontSize: hp('1.2%'),
        fontWeight: '600',
        color: '#D2691E',
    },
    updateRow: {
        marginBottom: hp('1.5%'),
        paddingBottom: hp('1%'),
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0E6D3',
    },
    updateLabel: {
        fontSize: hp('1.6%'),
        fontWeight: '700',
        color: '#333',
        marginBottom: hp('0.5%'),
    },
    updateValuesContainer: {
        marginLeft: wp('2%'),
    },
    originalValueContainer: {
        marginBottom: hp('0.5%'),
    },
    updatedValueContainer: {
        marginTop: hp('0.3%'),
    },
    updateOriginalLabel: {
        fontSize: hp('1.3%'),
        fontWeight: '600',
        color: '#888',
    },
    updateUpdatedLabel: {
        fontSize: hp('1.3%'),
        fontWeight: '600',
        color: '#16A34A',
    },
    updateOriginalValue: {
        fontSize: hp('1.5%'),
        color: '#666',
        marginLeft: wp('2%'),
    },
    updateUpdatedValue: {
        fontSize: hp('1.5%'),
        color: '#16A34A',
        fontWeight: '600',
        marginLeft: wp('2%'),
    },
    updateImageScroll: {
        flexDirection: 'row',
        marginTop: hp('0.5%'),
    },
    updateThumbnail: {
        width: wp('15%'),
        height: hp('7%'),
        borderRadius: 6,
        marginRight: wp('2%'),
        backgroundColor: '#eee',
    },
    noImageText: {
        fontSize: hp('1.3%'),
        color: '#999',
        fontStyle: 'italic',
    },
    updateTimestamp: {
        fontSize: hp('1.3%'),
        color: '#888',
        marginTop: hp('1%'),
        textAlign: 'right',
        fontStyle: 'italic',
    },
    heading: {
        fontSize: hp('2.8%'),
        fontWeight: '700',
        color: '#222',
    },
    row: {
        marginBottom: hp('1.8%'),
        paddingBottom: hp('1%'),
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
    },
    rowLocationInside: {
        flex: 1,
    },
    rowLocation: {
        marginBottom: hp('1.8%'),
        paddingBottom: hp('1%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        fontSize: hp('1.6%'),
        fontWeight: '700',
        color: '#111',
        marginBottom: hp('0.5%'),
    },
    labelMain: {
        fontSize: hp('1.7%'),
        fontWeight: '700',
        color: '#555',
        marginBottom: hp('2%'),
        marginTop: hp('1.2%'),
        letterSpacing: 0.5,
    },
    value: {
        fontSize: hp('1.8%'),
        fontWeight: '500',
        color: '#555',
        lineHeight: hp('2.3%'),
    },
    completed: {
        color: 'green',
        fontWeight: '700',
    },
    pending: {
        color: '#E8A317',
        fontWeight: '700',
    },
    cancelled: {
        color: 'red',
        fontWeight: '700',
    },
    pendingUpdate: {
        color: '#D2691E',
        fontWeight: '700',
        backgroundColor: '#FFE4B5',
        paddingHorizontal: wp('2%'),
        paddingVertical: hp('0.2%'),
        borderRadius: 4,
    },
    dropdownWrapper: {
        width: '100%',
        marginTop: hp('1.5%'),
        position: 'relative',
    },
    dropdownBtn: {
        backgroundColor: '#fff',
        paddingVertical: hp('1.2%'),
        paddingHorizontal: wp('4%'),
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'green',
    },
    dropdownTextContainer: {
        fontWeight: '600',
        color: '#555',
        fontSize: hp('1.7%'),
    },
    dropdownTextInside: {
        fontWeight: '600',
        color: '#555',
        fontSize: hp('1.5%'),
    },
    dropdownMenu: {
        position: 'absolute',
        top: hp('5.5%'),
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        zIndex: 99999,
    },
    dropdownItem: {
        paddingVertical: hp('1.8%'),
        paddingHorizontal: wp('4%'),
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    statusLabel: {
        fontSize: hp('2.1%'),
        marginTop: hp('1%'),
        fontWeight: '700',
        color: '#111',
    },
    ButtonContainer: {
        marginTop: hp('4%'),
        marginBottom: hp('1%'),
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    AcceptButton: {
        paddingVertical: hp('1.5%'),
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0,0.1)',
        elevation: 3,
        width: '100%',
    },
    AcceptText: {
        fontSize: hp('1.8%'),
        fontWeight: '500',
        color: '#fff',
        letterSpacing: 0.5,
    },
    loadingContainer: {
        marginTop: hp('15%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: hp('2%'),
        fontSize: hp('2%'),
        color: '#555',
    },
    carouselContainer: {
        paddingVertical: hp('1%'),
        flexDirection: 'row',
    },
    thumbnailImage: {
        width: wp('20%'),
        height: hp('10%'),
        borderRadius: 8,
        marginRight: wp('3%'),
        backgroundColor: '#eaeaea',
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    closeModalButton: {
        position: 'absolute',
        top: hp('6%'),
        right: wp('5%'),
        zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    closeModalText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: hp('1.6%'),
    },
    viewerWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: SCREEN_WIDTH,
    },
    zoomContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: SCREEN_WIDTH,
        height: hp('80%'),
    },
    arrowButton: {
        position: 'absolute',
        zIndex: 150,
        backgroundColor: 'rgba(122, 121, 121, 0.2)',
        width: hp('5.5%'),
        height: hp('5.5%'),
        borderRadius: hp('2.75%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftArrow: {
        left: wp('4%'),
    },
    rightArrow: {
        right: wp('4%'),
    },
    arrowText: {
        color: '#090808',
        fontSize: hp('4.5%'),
        fontWeight: '300',
        lineHeight: hp('4.8%'),
    },
    swipeIndicator: {
        position: 'absolute',
        bottom: hp('6%'),
        alignSelf: 'center',
        color: '#aaa',
        fontSize: hp('1.7%'),
        fontWeight: '600',
    },
});