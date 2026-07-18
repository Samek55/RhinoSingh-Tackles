import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CustomTabBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity 
          key={tab} 
          onPress={() => onTabChange(tab)} 
          style={styles.tab}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
          {activeTab === tab && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderColor: '#e0e0e0', 
    backgroundColor: '#fff' 
  },
  tab: { 
    flex: 1, 
    paddingVertical: 18, 
    alignItems: 'center' 
  },
  tabText: { 
    color: '#888', 
    fontWeight: '600' 
  },
  activeTabText: { 
    color: '#2c5f59' 
  },
  activeIndicator: { 
    height: 3, 
    backgroundColor: '#2c5f59', 
    position: 'absolute', 
    bottom: 0, 
    width: '100%' 
  },
});

export default CustomTabBar;