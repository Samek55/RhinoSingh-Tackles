import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Header2 from '@/components/Header2';

const VerifiedScreen = () => {
  return (
    <View style={styles.wrapper}>
      <Header2 />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Icon Circle with consistent padding */}
          <View style={styles.iconCircle}>
            <Image
              source={require('../../../../assets/icons/admin/check-mark.png')}
              style={styles.image}
            />
          </View>
          
          <View style={styles.textGroup}>
            <Text style={styles.title}>Booking Confirmed!</Text>
            <Text style={styles.subtitle}>
              Your request has been successfully processed. Our team will be in touch shortly.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.8}
            onPress={() => router.replace('/Home')}
          >
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: '10%',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 200,
    backgroundColor: '#fafafa', // Softer sage background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
 
  },
  image: {
    width: 150,
    height: 150,
    tintColor: '#065F46', // Deep emerald
    resizeMode: 'contain',
  },
  textGroup: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 5,
  },
  button: {
    backgroundColor: '#064E3B',
    paddingVertical: 18,
    width: '100%',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default VerifiedScreen;