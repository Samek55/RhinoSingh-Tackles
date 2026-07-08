import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import ArrowDownIcon from '../../assets/icons/contact/downarrow.png';
import DelIcon from '../../assets/icons/contact/deleteicon.png';

const { width, height } = Dimensions.get('window');

type FileItem = {
  uri: string;
  fileName?: string;
  sizeMB?: number;
  mimeType?: string;
  type?: 'image' | 'pdf';
};

type Props = {
  value: FileItem[];
  onChange: (files: FileItem[]) => void;
  maxFiles?: number;
  minFiles?: number;
  maxFileSizeMB?: number; // Maximum file size in MB (default: 10MB)
};

const FileUploadBox: React.FC<Props> = ({ 
  value, 
  onChange, 
  maxFiles = 5,
  minFiles = 0,
  maxFileSizeMB = 10 // Default 10MB
}) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Check if file size is valid
  const isFileSizeValid = (sizeMB: number = 0) => {
    return sizeMB <= maxFileSizeMB;
  };

  const pickFiles = async () => {
    if (value.length >= maxFiles) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxFiles} files`);
      return;
    }

    Alert.alert(
      'Upload File',
      `Choose the type of file to upload (Max ${maxFileSizeMB}MB per file)`,
      [
        {
          text: 'Image (PNG, JPG, JPEG)',
          onPress: pickImages,
        },
        {
          text: 'PDF Document',
          onPress: pickPDF,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImages = async () => {
    if (value.length >= maxFiles) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxFiles} files`);
      return;
    }

    const remainingSlots = maxFiles - value.length;
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: remainingSlots,
    });

    if (result.canceled) return;

    // Filter files by size
    const validFiles: FileItem[] = [];
    const invalidFiles: string[] = [];

    result.assets.forEach(asset => {
      const sizeMB = asset.fileSize
        ? +(asset.fileSize / (1024 * 1024)).toFixed(2)
        : 0;
      
      if (isFileSizeValid(sizeMB)) {
        validFiles.push({
          uri: asset.uri,
          fileName: asset.fileName || 'Unnamed file',
          sizeMB: sizeMB,
          mimeType: asset.mimeType || 'image/jpeg',
          type: 'image' as const,
        });
      } else {
        invalidFiles.push(asset.fileName || 'Unnamed file');
      }
    });

    // Show alert for invalid files
    if (invalidFiles.length > 0) {
      Alert.alert(
        'File Size Limit Exceeded',
        `The following file(s) exceed the ${maxFileSizeMB}MB limit and were skipped:\n${invalidFiles.join('\n')}`
      );
    }

    if (validFiles.length === 0) {
      Alert.alert('No Valid Files', `All selected files exceed the ${maxFileSizeMB}MB limit`);
      return;
    }

    const combinedFiles = [...value, ...validFiles];
    const trimmedFiles = combinedFiles.slice(0, maxFiles);
    onChange(trimmedFiles);

    if (combinedFiles.length > maxFiles) {
      Alert.alert('Limit Reached', `Only ${maxFiles} files can be uploaded. The first ${maxFiles} were selected.`);
    }
  };

  const pickPDF = async () => {
    try {
      if (value.length >= maxFiles) {
        Alert.alert('Limit Reached', `You can only upload up to ${maxFiles} files`);
        return;
      }

      const remainingSlots = maxFiles - value.length;
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) return;

      // Filter files by size
      const validFiles: FileItem[] = [];
      const invalidFiles: string[] = [];

      result.assets.slice(0, remainingSlots).forEach(asset => {
        const sizeMB = asset.size
          ? +(asset.size / (1024 * 1024)).toFixed(2)
          : 0;
        
        if (isFileSizeValid(sizeMB)) {
          validFiles.push({
            uri: asset.uri,
            fileName: asset.name || 'Unnamed file',
            sizeMB: sizeMB,
            mimeType: asset.mimeType || 'application/pdf',
            type: 'pdf' as const,
          });
        } else {
          invalidFiles.push(asset.name || 'Unnamed file');
        }
      });

      // Show alert for invalid files
      if (invalidFiles.length > 0) {
        Alert.alert(
          'File Size Limit Exceeded',
          `The following file(s) exceed the ${maxFileSizeMB}MB limit and were skipped:\n${invalidFiles.join('\n')}`
        );
      }

      if (validFiles.length === 0) {
        Alert.alert('No Valid Files', `All selected files exceed the ${maxFileSizeMB}MB limit`);
        return;
      }

      const combinedFiles = [...value, ...validFiles];
      const trimmedFiles = combinedFiles.slice(0, maxFiles);
      onChange(trimmedFiles);

      if (combinedFiles.length > maxFiles) {
        Alert.alert('Limit Reached', `Only ${maxFiles} files can be uploaded. The first ${maxFiles} were selected.`);
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'Failed to select PDF file');
    }
  };

  const removeFile = (uri: string) => {
    const updated = value.filter(item => item.uri !== uri);
    onChange(updated);

    if (previewIndex !== null) {
      const newLength = updated.length;
      if (newLength === 0) setPreviewIndex(null);
      else if (previewIndex >= newLength) setPreviewIndex(newLength - 1);
    }
  };

  const isImage = (file: FileItem) => {
    return file.type === 'image' || 
           (file.mimeType && file.mimeType.startsWith('image/'));
  };

  // Get file size display text
  const getSizeDisplay = (sizeMB: number) => {
    if (sizeMB < 1) {
      return `${(sizeMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeMB.toFixed(2)} MB`;
  };

  return (
    <View style={styles.container}>
      {/* EMPTY DASHED UPLOAD BOX */}
      {value.length === 0 && (
        <TouchableOpacity style={styles.boxEmpty} onPress={pickFiles} activeOpacity={0.7}>
          <View style={styles.emptyState}>
            <Image source={ArrowDownIcon} style={styles.uploadIcon} />
            <Text style={styles.placeholder}>
              Drop files/photos here
            </Text>
            <Text style={styles.fileLimitText}>
              Supports PNG, JPG, JPEG & PDF (Max {maxFiles} files, {maxFileSizeMB}MB each)
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* STABLE GRID CONTAINER AND ITEMS */}
      {value.length > 0 && (
        <View style={styles.boxFilled}>
          <View style={styles.previewGrid}>
            {value.map((item, index) => (
              <View key={item.uri} style={styles.columnWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    if (isImage(item)) {
                      setPreviewIndex(index);
                    } else {
                      Alert.alert('Preview Not Available', 'PDF preview is not available');
                    }
                  }}
                  style={styles.previewCard}
                  activeOpacity={0.9}
                >
                  {isImage(item) ? (
                    <Image source={{ uri: item.uri }} style={styles.previewImage} />
                  ) : (
                    <View style={[styles.previewImage, styles.pdfIconContainer]}>
                      <Text style={styles.pdfIconText}>PDF</Text>
                    </View>
                  )}

                  <View style={styles.previewInfo}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.fileName}
                    </Text>
                    {item.sizeMB !== undefined && item.sizeMB > 0 ? (
                      <Text style={styles.size}>{getSizeDisplay(item.sizeMB)}</Text>
                    ) : null}
                  </View>

                  <TouchableOpacity 
                    onPress={() => removeFile(item.uri)} 
                    style={styles.deleteHitSlop}
                  >
                    <Image source={DelIcon} style={styles.deleteIcon} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ))}

            {/* SYMMETRICAL ADD MORE ATTACHMENT ACTION - Only show if less than max files */}
            {value.length < maxFiles && (
              <View style={styles.columnWrapper}>
                <TouchableOpacity style={styles.addMore} onPress={pickFiles} activeOpacity={0.7}>
                  <Text style={styles.addText}>+ Add more</Text>
                  <Text style={styles.addCountText}>{value.length}/{maxFiles}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* FULL SCREEN LIGHTBOX DIALOG PREVIEW - Only for images */}
      <Modal visible={previewIndex !== null} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setPreviewIndex(null)}
          >
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '300' }}>✕</Text>
          </TouchableOpacity>

          {previewIndex !== null && isImage(value[previewIndex]) && (
            <Image
              source={{ uri: value[previewIndex].uri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}

          {previewIndex !== null && (
            <TouchableOpacity
              style={styles.deleteFromPreview}
              onPress={() => removeFile(value[previewIndex].uri)}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                Delete File
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default FileUploadBox;

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 16,
  },
  boxEmpty: {
    minHeight: 110,
    borderWidth: 1.5,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderColor: '#B2C5FF',
    backgroundColor: '#F8FAFC',
    padding: 16,
    justifyContent: 'center',
  },
  boxFilled: {
    minHeight: 110,
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    width: 24,
    height: 24,
    tintColor: '#2F6BFF',
  },
  placeholder: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  fileLimitText: {
    marginTop: 4,
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  columnWrapper: {
    width: '50%',
    padding: 6,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 10,
    height: 56,
  },
  previewImage: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  pdfIconContainer: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  pdfIconText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewInfo: {
    flex: 1,
    paddingHorizontal: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  size: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  deleteHitSlop: {
    padding: 4,
  },
  deleteIcon: {
    width: 14,
    height: 14,
    tintColor: '#94A3B8',
  },
  addMore: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#FAFAFA',
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F6BFF',
  },
  addCountText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height * 0.75,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 30,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteFromPreview: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});