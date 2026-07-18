import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image as RNImage,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { announcementService } from '@/src/services/supabaseService';
import { uploadImageToSupabaseRoadBlockUpdated } from '@/src/utils/fileUploadRoadBlockUpdated';
import InputField from '@/components/admin/InputField';
import MultiSelectDropdown from '@/components/admin/MultiSelectDropdown';
import SingleSelectDropdown from '@/components/admin/SingleSelectDropdown';
import { services, city } from '@/src/data/Data';

interface Banner {
  id: string;
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

interface AllBannersListProps {
  onEditBanner?: (banner: Banner) => void;
  refreshTrigger?: boolean;
  onBannerUpdated?: () => void;
}

const AllBannersList: React.FC<AllBannersListProps> = ({ 
  onEditBanner, 
  refreshTrigger,
  onBannerUpdated 
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    countdownTimer: '',
    imageUrl: '',
    message: '',
    buttonLink: '',
    startDate: '',
    endDate: '',
    uploadedBy: '',
  });
  const [editSelectedCities, setEditSelectedCities] = useState<string[]>([]);
  const [editSelectedUsers, setEditSelectedUsers] = useState<string[]>([]);
  const [editSelectedServices, setEditSelectedServices] = useState<string[]>([]);
  const [editSelectedButtonText, setEditSelectedButtonText] = useState('');
  const [editCustomButtonText, setEditCustomButtonText] = useState('');
  const [editLocalImageUri, setEditLocalImageUri] = useState<string | null>(null);
  const [editUploadingImage, setEditUploadingImage] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const userOptions = ['Public', 'Customer', 'WorkForce Admin'];
  const buttonOptions = [
    'View More',
    'Download Now',
    'Install Now',
    'Buy Now',
    'Learn More',
    'Watch Video',
    'Grab Offer',
    'Join Now',
    'Review Now',
    'Suggest a Feature',
    'Other'
  ];

  const isWorkForceSelected = editSelectedUsers.includes('WorkForce Admin');

  useEffect(() => {
    fetchBanners();
  }, [refreshTrigger]);

  const fetchBanners = async () => {
    try {
      setRefreshing(true);
      const data = await announcementService.getAllAnnouncements();
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      Alert.alert('Error', 'Failed to fetch banners');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchBanners();
  };

  const handleDeleteBanner = async (id: string) => {
    Alert.alert(
      'Delete Banner',
      'Are you sure you want to delete this banner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await announcementService.deleteAnnouncement(id);
              Alert.alert('Success', 'Banner deleted successfully');
              fetchBanners();
            } catch (error) {
              console.error('Error deleting banner:', error);
              Alert.alert('Error', 'Failed to delete banner');
            }
          }
        }
      ]
    );
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await announcementService.toggleAnnouncementStatus(banner.id, !banner.active);
      Alert.alert('Success', `Banner ${!banner.active ? 'activated' : 'deactivated'} successfully`);
      fetchBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
      Alert.alert('Error', 'Failed to update banner status');
    }
  };

  const handlePreview = (banner: Banner) => {
    Alert.alert(
      'Banner Preview',
      `Title: ${banner.name}\nMessage: ${banner.message}\nButton: ${banner.button_text}\nLink: ${banner.button_link}`,
      [{ text: 'Close' }]
    );
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setEditFormData({
      name: banner.name || '',
      countdownTimer: String(banner.countdown_timer || ''),
      imageUrl: banner.image_url || '',
      message: banner.message || '',
      buttonLink: banner.button_link || '',
      startDate: banner.start_date || '',
      endDate: banner.end_date || '',
      uploadedBy: banner.uploaded_by || '',
    });
    setEditSelectedCities(banner.city || []);
    setEditSelectedUsers(banner.user_selection || []);
    setEditSelectedServices(banner.profession || []);
    setEditSelectedButtonText(banner.button_text || '');
    setEditCustomButtonText('');
    setEditLocalImageUri(null);
    setEditModalVisible(true);
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickEditImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setEditLocalImageUri(uri);
        
        setEditUploadingImage(true);
        try {
          // Upload to "roadblock/updated" folder
          const uploadedUrl = await uploadImageToSupabaseRoadBlockUpdated({
            uri: uri,
            fileName: `banner-${Date.now()}.jpg`
          });
          
          if (uploadedUrl) {
            setEditFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
            Alert.alert('Success', 'Image uploaded successfully!');
          } else {
            Alert.alert('Upload Failed', 'Failed to upload image');
            setEditLocalImageUri(null);
          }
        } catch (error) {
          console.error('Upload error:', error);
          Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
          setEditLocalImageUri(null);
        } finally {
          setEditUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const validateEditForm = () => {
    if (!editFormData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter banner name');
      return false;
    }
    if (editSelectedCities.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one city');
      return false;
    }
    if (editSelectedUsers.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one user type');
      return false;
    }
    if (isWorkForceSelected && editSelectedServices.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one profession');
      return false;
    }
    if (!editFormData.message.trim()) {
      Alert.alert('Validation Error', 'Please enter a message');
      return false;
    }
    if (!editFormData.imageUrl) {
      Alert.alert('Validation Error', 'Please upload a banner image');
      return false;
    }
    if (!editSelectedButtonText) {
      Alert.alert('Validation Error', 'Please select button text');
      return false;
    }
    if (!editFormData.buttonLink.trim()) {
      Alert.alert('Validation Error', 'Please enter button link');
      return false;
    }
    if (!editFormData.startDate.trim() || !editFormData.endDate.trim()) {
      Alert.alert('Validation Error', 'Please enter start and end dates');
      return false;
    }
    return true;
  };

  const handleUpdateBanner = async () => {
    if (!validateEditForm() || !editingBanner) return;

    setEditLoading(true);
    try {
      const oldImageUrl = editingBanner.image_url;
      
      const updateData = {
        name: editFormData.name,
        city: editSelectedCities,
        user_selection: editSelectedUsers,
        profession: isWorkForceSelected ? editSelectedServices : [],
        countdown_timer: parseInt(editFormData.countdownTimer) || 0,
        image_url: editFormData.imageUrl,
        message: editFormData.message,
        button_text: editSelectedButtonText === 'Other' ? editCustomButtonText || 'Learn More' : editSelectedButtonText,
        button_link: editFormData.buttonLink,
        start_date: editFormData.startDate,
        end_date: editFormData.endDate,
        uploaded_by: editFormData.uploadedBy || 'Unknown',
        updated_at: new Date().toISOString()
      };

      // Update the banner with new data
      await announcementService.updateAnnouncement(editingBanner.id, updateData);
      
      // Delete the old image if it was changed
      if (oldImageUrl && oldImageUrl !== editFormData.imageUrl) {
        try {
          await announcementService.deleteImageFromStorage(oldImageUrl);
          console.log('Old image deleted successfully');
        } catch (deleteError) {
          console.log('Failed to delete old image:', deleteError);
          // Don't block the update if deletion fails
        }
      }
      
      Alert.alert('Success', 'Banner updated successfully!');
      setEditModalVisible(false);
      fetchBanners();
      
      if (onBannerUpdated) {
        onBannerUpdated();
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      Alert.alert('Error', 'Failed to update banner. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const renderEditModal = () => {
    if (!editingBanner) return null;

    return (
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Banner</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <MultiSelectDropdown
                label="CITY"
                options={city}
                selectedItems={editSelectedCities}
                onSelect={setEditSelectedCities}
                placeholder="Select cities..."
              />
              
              <MultiSelectDropdown
                label="USER SELECTION"
                options={userOptions}
                selectedItems={editSelectedUsers}
                onSelect={setEditSelectedUsers}
                placeholder="Select users..."
              />

              {isWorkForceSelected && (
                <MultiSelectDropdown
                  label="PROFESSION"
                  options={services}
                  selectedItems={editSelectedServices}
                  onSelect={setEditSelectedServices}
                  placeholder="Select professions..."
                />
              )}

              <InputField 
                label="1. Name of banner" 
                placeholder="Banner name" 
                value={editFormData.name}
                onChangeText={(text: string) => handleEditInputChange('name', text)}
              />
              
              <InputField 
                label="2. Countdown Timer (seconds)" 
                placeholder="Enter seconds (e.g., 30)" 
                keyboardType="number-pad"
                value={editFormData.countdownTimer}
                onChangeText={(text: string) => handleEditInputChange('countdownTimer', text)}
              />
              
              {/* Image Upload Section */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>3. Banner Image</Text>
                <TouchableOpacity 
                  style={styles.imagePickerButton} 
                  onPress={pickEditImage}
                  disabled={editUploadingImage}
                  activeOpacity={0.8}
                >
                  {editUploadingImage ? (
                    <View style={styles.imageUploading}>
                      <ActivityIndicator size="large" color="#2c5f59" />
                      <Text style={styles.uploadingText}>Uploading...</Text>
                    </View>
                  ) : editLocalImageUri || editFormData.imageUrl ? (
                    <RNImage 
                      source={{ uri: editLocalImageUri || editFormData.imageUrl }} 
                      style={styles.imagePreview} 
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={40} color="#9BBAB8" />
                      <Text style={styles.imagePlaceholderText}>Tap to select a banner image</Text>
                      <Text style={styles.imagePlaceholderSubtext}>Square image recommended (1080×1080)</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {editFormData.imageUrl && !editUploadingImage && (
                  <View style={styles.uploadSuccessContainer}>
                    <Ionicons name="checkmark-circle" size={16} color="#2c5f59" />
                    <Text style={styles.uploadSuccessText}>Image uploaded successfully</Text>
                  </View>
                )}
              </View>
              
              <InputField 
                label="4. Message" 
                placeholder="Enter message here..." 
                multiline={true} 
                height={120}
                value={editFormData.message}
                onChangeText={(text: string) => handleEditInputChange('message', text)}
              />
              
              <SingleSelectDropdown
                label="5. Button Text"
                options={buttonOptions}
                selectedValue={editSelectedButtonText}
                onSelect={setEditSelectedButtonText}
                placeholder="Select button text..."
                showCustomInput={true}
                customValue={editCustomButtonText}
                onCustomChange={setEditCustomButtonText}
              />
              
              <InputField 
                label="6. Button Link" 
                placeholder="https://..." 
                value={editFormData.buttonLink}
                onChangeText={(text: string) => handleEditInputChange('buttonLink', text)}
              />
              
              <View style={styles.divider} />
              
              <InputField 
                label="7. Banner starting date" 
                placeholder="YYYY-MM-DD" 
                value={editFormData.startDate}
                onChangeText={(text: string) => handleEditInputChange('startDate', text)}
              />
              
              <InputField 
                label="8. Banner ending date" 
                placeholder="YYYY-MM-DD" 
                value={editFormData.endDate}
                onChangeText={(text: string) => handleEditInputChange('endDate', text)}
              />
              
              <InputField 
                label="9. Banner uploaded by (phone number)" 
                placeholder="+977..." 
                keyboardType="phone-pad"
                value={editFormData.uploadedBy}
                onChangeText={(text: string) => handleEditInputChange('uploadedBy', text)}
              />

              {/* Update Button */}
              <TouchableOpacity 
                style={[styles.updateButton, (editLoading || editUploadingImage) && styles.disabledButton]} 
                onPress={handleUpdateBanner}
                disabled={editLoading || editUploadingImage}
              >
                {editLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.updateButtonText}>Update Banner</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading && banners.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2c5f59" />
        <Text style={styles.loadingText}>Loading banners...</Text>
      </View>
    );
  }

  if (banners.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="pricetags-outline" size={60} color="#9BBAB8" />
        <Text style={styles.emptyText}>No banners found</Text>
        <Text style={styles.emptySubtext}>Create your first banner in the Compose tab</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={banners}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.bannerListContent}
        renderItem={({ item }) => (
          <View style={styles.bannerCard}>
            <View style={styles.bannerCardHeader}>
              <View style={styles.bannerCardTitleContainer}>
                <Text style={styles.bannerCardTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={[styles.statusBadge, item.active ? styles.activeBadge : styles.inactiveBadge]}>
                  <Text style={styles.statusBadgeText}>
                    {item.active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              <View style={styles.bannerCardActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="create-outline" size={18} color="#2c5f59" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteBanner(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.bannerCardPreview}>
              <RNImage 
                source={{ uri: item.image_url }} 
                style={styles.bannerCardImage}
                resizeMode="cover"
              />
              <View style={styles.bannerCardInfo}>
                <Text style={styles.bannerCardMessage} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={styles.bannerCardDates}>
                  {item.start_date} → {item.end_date}
                </Text>
                <Text style={styles.bannerCardTargets}>
                  {item.city.length > 0 && `📍 ${item.city.join(', ')}`}
                  {item.user_selection.length > 0 && ` • 👥 ${item.user_selection.join(', ')}`}
                </Text>
              </View>
            </View>

            <View style={styles.bannerCardFooter}>
              <TouchableOpacity 
                style={[styles.toggleButton, item.active ? styles.toggleActive : styles.toggleInactive]}
                onPress={() => handleToggleActive(item)}
              >
                <Ionicons 
                  name={item.active ? 'eye-outline' : 'eye-off-outline'} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.toggleButtonText}>
                  {item.active ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.previewButton}
                onPress={() => handlePreview(item)}
              >
                <Ionicons name="eye-outline" size={16} color="#2c5f59" />
                <Text style={styles.previewButtonText}>Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {renderEditModal()}
    </>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C2B2A',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9BBAB8',
    marginTop: 4,
  },
  bannerListContent: {
    padding: 16,
    paddingBottom: 30,
  },
  bannerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8ecec',
  },
  bannerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bannerCardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C2B2A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#e8f5e9',
  },
  inactiveBadge: {
    backgroundColor: '#f5f5f5',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1C2B2A',
  },
  bannerCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#e8f3f1',
  },
  deleteButton: {
    backgroundColor: '#fde8e8',
  },
  bannerCardPreview: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bannerCardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  bannerCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerCardMessage: {
    fontSize: 13,
    color: '#4A5B5A',
    marginBottom: 4,
  },
  bannerCardDates: {
    fontSize: 11,
    color: '#9BBAB8',
    fontWeight: '500',
  },
  bannerCardTargets: {
    fontSize: 11,
    color: '#9BBAB8',
    marginTop: 2,
  },
  bannerCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f4f3',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  toggleActive: {
    backgroundColor: '#2c5f59',
  },
  toggleInactive: {
    backgroundColor: '#9BBAB8',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2c5f59',
  },
  previewButtonText: {
    color: '#2c5f59',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C2B2A',
  },
  inputWrapper: {
    marginTop: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  imagePickerButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  imagePlaceholderSubtext: {
    color: '#9BBAB8',
    fontSize: 12,
  },
  imageUploading: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  uploadingText: {
    color: '#2c5f59',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadSuccessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e8f5e9',
    borderRadius: 6,
  },
  uploadSuccessText: {
    color: '#2c5f59',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 25,
  },
  updateButton: {
    backgroundColor: '#2c5f59',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default AllBannersList;