import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, Alert, StyleSheet, 
  ScrollView, TouchableOpacity, ActivityIndicator,
  Image as RNImage, FlatList, RefreshControl
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header3 from '@/components/Header3drawer';
import { services } from '@/src/data/Data';
import { ALL_CITIES } from '@/src/constants/countryData';
import { announcementService } from '@/src/services/supabaseService';
import { Ionicons } from '@expo/vector-icons';
import { uploadImageToSupabaseRoadBlock } from '@/src/utils/fileUploadRoadBlock';

// Import reusable components
import InputField from '@/components/admin/InputField';
import MultiSelectDropdown from '@/components/admin/MultiSelectDropdown';
import SingleSelectDropdown from '@/components/admin/SingleSelectDropdown';
import CustomTabBar from '@/components/admin/CustomTabBar';
import RoadBlockCard from '@/components/RoadBlockCard';

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

const PopupBannerScreen = () => {
  const [activeTab, setActiveTab] = useState('Compose');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    countdownTimer: '',
    imageUrl: '',
    message: '',
    buttonLink: '',
    startDate: '',
    endDate: '',
    uploadedBy: '',
  });
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedButtonText, setSelectedButtonText] = useState('');
  const [customButtonText, setCustomButtonText] = useState('');

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

  const isWorkForceSelected = selectedUsers.includes('WorkForce Admin');

  // Fetch banners when on All Banners tab
  useEffect(() => {
    if (activeTab === 'All Banners') {
      fetchBanners();
    }
  }, [activeTab]);

  const fetchBanners = async () => {
    try {
      setRefreshing(true);
      const data = await announcementService.getAllAnnouncements();
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      Alert.alert('Error', 'Failed to fetch banners');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchBanners();
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData({
      name: banner.name || '',
      countdownTimer: String(banner.countdown_timer || ''),
      imageUrl: banner.image_url || '',
      message: banner.message || '',
      buttonLink: banner.button_link || '',
      startDate: banner.start_date || '',
      endDate: banner.end_date || '',
      uploadedBy: banner.uploaded_by || '',
    });
    setSelectedCities(banner.city || []);
    setSelectedUsers(banner.user_selection || []);
    setSelectedServices(banner.profession || []);
    setSelectedButtonText(banner.button_text || '');
    setCustomButtonText('');
    setLocalImageUri(null);
    setActiveTab('Compose');
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

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      countdownTimer: '',
      imageUrl: '',
      message: '',
      buttonLink: '',
      startDate: '',
      endDate: '',
      uploadedBy: '',
    });
    setSelectedCities([]);
    setSelectedUsers([]);
    setSelectedServices([]);
    setSelectedButtonText('');
    setCustomButtonText('');
    setLocalImageUri(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
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
        setLocalImageUri(uri);
        
        setUploadingImage(true);
        try {
          const uploadedUrl = await uploadImageToSupabaseRoadBlock({
            uri: uri,
            fileName: `banner-${Date.now()}.jpg`
          });
          
          if (uploadedUrl) {
            setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
            Alert.alert('Success', 'Image uploaded successfully!');
          } else {
            Alert.alert('Upload Failed', 'Failed to upload image');
            setLocalImageUri(null);
          }
        } catch (error) {
          console.error('Upload error:', error);
          Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
          setLocalImageUri(null);
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter banner name');
      return false;
    }
    if (selectedCities.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one city');
      return false;
    }
    if (selectedUsers.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one user type');
      return false;
    }
    if (isWorkForceSelected && selectedServices.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one profession');
      return false;
    }
    if (!formData.message.trim()) {
      Alert.alert('Validation Error', 'Please enter a message');
      return false;
    }
    if (!formData.imageUrl) {
      Alert.alert('Validation Error', 'Please upload a banner image');
      return false;
    }
    if (!selectedButtonText) {
      Alert.alert('Validation Error', 'Please select button text');
      return false;
    }
    if (!formData.buttonLink.trim()) {
      Alert.alert('Validation Error', 'Please enter button link');
      return false;
    }
    if (!formData.startDate.trim() || !formData.endDate.trim()) {
      Alert.alert('Validation Error', 'Please enter start and end dates');
      return false;
    }
    return true;
  };

  const handlePushBanner = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const announcementData = {
        name: formData.name,
        city: selectedCities,
        user_selection: selectedUsers,
        profession: isWorkForceSelected ? selectedServices : [],
        countdown_timer: parseInt(formData.countdownTimer) || 0,
        image_url: formData.imageUrl,
        message: formData.message,
        button_text: selectedButtonText === 'Other' ? customButtonText || 'Learn More' : selectedButtonText,
        button_link: formData.buttonLink,
        start_date: formData.startDate,
        end_date: formData.endDate,
        uploaded_by: formData.uploadedBy || 'Unknown',
        active: true
      };

      if (editingId) {
        // For update, we need to handle it differently since the service only has toggle
        // We'll use toggle to deactivate old and create new, or you can add update method
        Alert.alert('Info', 'Update functionality coming soon. Please create a new banner.');
        setLoading(false);
        return;
      } else {
        await announcementService.createAnnouncement(announcementData);
        Alert.alert('Success! 🎉', 'Banner published successfully!');
      }
      
      resetForm();
      setActiveTab('All Banners');
      fetchBanners();
    } catch (error) {
      console.error('Error publishing banner:', error);
      Alert.alert('Error', 'Failed to publish banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine if we should show the preview
  const hasPreviewData = formData.imageUrl || formData.message || formData.name;
  
  // Resolve the final button text
  const resolvedButtonText = selectedButtonText === 'Other' 
    ? customButtonText || 'Learn More' 
    : selectedButtonText || 'View More';

  // Preview data for RoadBlockCard
  const previewData = {
    title: formData.name || 'Banner Title',
    imageUrl: formData.imageUrl || 'https://via.placeholder.com/400x400/295C59/FFFFFF?text=Upload+Image',
    message: formData.message || 'Your banner message will appear here.',
    buttonLabel: resolvedButtonText,
    countdownSeconds: parseInt(formData.countdownTimer) || 0,
  };

  // Render All Banners Tab
  const renderAllBanners = () => {
    if (refreshing && banners.length === 0) {
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
                  onPress={() => handleEditBanner(item)}
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
                  {(item.city || []).length > 0 && `📍 ${item.city.join(', ')}`}
                  {(item.user_selection || []).length > 0 && ` • 👥 ${item.user_selection.join(', ')}`}
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
                onPress={() => {
                  // Show a preview modal or alert
                  Alert.alert(
                    'Banner Preview',
                    `Title: ${item.name}\nMessage: ${item.message}\nButton: ${item.button_text}\nLink: ${item.button_link}`,
                    [{ text: 'Close' }]
                  );
                }}
              >
                <Ionicons name="eye-outline" size={16} color="#2c5f59" />
                <Text style={styles.previewButtonText}>Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header3 />
      
      <CustomTabBar 
        tabs={['Compose', 'All Banners']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'Compose' ? (
        <ScrollView style={styles.formContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.formSection}>
            <MultiSelectDropdown
              label="CITY"
              options={ALL_CITIES}
              selectedItems={selectedCities}
              onSelect={setSelectedCities}
              placeholder="Select cities..."
            />
            
            <MultiSelectDropdown
              label="USER SELECTION"
              options={userOptions}
              selectedItems={selectedUsers}
              onSelect={setSelectedUsers}
              placeholder="Select users..."
            />

            {isWorkForceSelected && (
              <MultiSelectDropdown
                label="PROFESSION"
                options={services}
                selectedItems={selectedServices}
                onSelect={setSelectedServices}
                placeholder="Select professions..."
              />
            )}

            <InputField 
              label="1. Name of banner" 
              placeholder="Banner name" 
              value={formData.name}
              onChangeText={(text: string) => handleInputChange('name', text)}
            />
            
            <InputField 
              label="2. Countdown Timer (seconds)" 
              placeholder="Enter seconds (e.g., 30)" 
              keyboardType="number-pad"
              value={formData.countdownTimer}
              onChangeText={(text: string) => handleInputChange('countdownTimer', text)}
            />
            
            {/* Image Upload Section */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>3. Banner Image</Text>
              <TouchableOpacity 
                style={styles.imagePickerButton} 
                onPress={pickImage}
                disabled={uploadingImage}
                activeOpacity={0.8}
              >
                {uploadingImage ? (
                  <View style={styles.imageUploading}>
                    <ActivityIndicator size="large" color="#2c5f59" />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                ) : localImageUri || formData.imageUrl ? (
                  <RNImage 
                    source={{ uri: localImageUri || formData.imageUrl }} 
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
              {formData.imageUrl && !uploadingImage && (
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
              value={formData.message}
              onChangeText={(text: string) => handleInputChange('message', text)}
            />
            
            <SingleSelectDropdown
              label="5. Button Text"
              options={buttonOptions}
              selectedValue={selectedButtonText}
              onSelect={setSelectedButtonText}
              placeholder="Select button text..."
              showCustomInput={true}
              customValue={customButtonText}
              onCustomChange={setCustomButtonText}
            />
            
            <InputField 
              label="6. Button Link" 
              placeholder="https://..." 
              value={formData.buttonLink}
              onChangeText={(text: string) => handleInputChange('buttonLink', text)}
            />
            
            <View style={styles.divider} />
            
            <InputField 
              label="7. Banner starting date" 
              placeholder="YYYY-MM-DD" 
              value={formData.startDate}
              onChangeText={(text: string) => handleInputChange('startDate', text)}
            />
            
            <InputField 
              label="8. Banner ending date" 
              placeholder="YYYY-MM-DD" 
              value={formData.endDate}
              onChangeText={(text: string) => handleInputChange('endDate', text)}
            />
            
            <InputField 
              label="9. Banner uploaded by (phone number)" 
              placeholder="+977..." 
              keyboardType="phone-pad"
              value={formData.uploadedBy}
              onChangeText={(text: string) => handleInputChange('uploadedBy', text)}
            />

           

            {/* Push Banner Button */}
            <TouchableOpacity 
              style={[styles.saveButton, (loading || uploadingImage) && styles.disabledButton]} 
              onPress={handlePushBanner}
              disabled={loading || uploadingImage}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingId ? 'Update Banner' : 'Push Banner'}
                </Text>
              )}
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity onPress={resetForm} style={styles.cancelEditButton}>
                <Text style={styles.cancelEditText}>Cancel Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        renderAllBanners()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fcfb' },
  formContainer: { flex: 1 },
  scrollContent: { paddingBottom: 50 },
  formSection: { padding: 20 },
  inputWrapper: { marginTop: 20 },
  label: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#444', 
    marginBottom: 8, 
    textTransform: 'uppercase' 
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
    marginVertical: 25 
  },
  saveButton: { 
    backgroundColor: '#2c5f59', 
    padding: 18, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 30 
  },
  saveButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelEditButton: {
    alignSelf: 'center',
    marginTop: 12,
  },
  cancelEditText: {
    color: '#9BBAB8',
    fontWeight: '700',
    fontSize: 13,
  },
  // Preview Styles
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 30,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2c5f59',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewContainer: {
    backgroundColor: '#f5f8f7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2c5f59',
    borderStyle: 'dashed',
    minHeight: 200,
    justifyContent: 'center',
  },
  previewInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f7f6',
    borderRadius: 10,
  },
  previewInfoText: {
    fontSize: 13,
    color: '#2c5f59',
    fontWeight: '600',
    textAlign: 'center',
  },
  previewInfoSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  // All Banners Styles
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
});

export default PopupBannerScreen;