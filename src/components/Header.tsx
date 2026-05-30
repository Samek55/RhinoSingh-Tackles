import {View, Image, StyleSheet, Dimensions, Text} from 'react-native';
import React from 'react';

const {width,height} = Dimensions.get('window');

const Header = ({style}: any) => {
  return (
    <View style={[styles.headerContainer, style]}>
         <View style={styles.leftSection}>
           <Image
             source={require('../../assets/images/icon.png')}
             style={styles.leftIcon}
             resizeMode="contain"
           />
           <Text style={styles.title}>RocketSingh</Text>
         </View>
   
         <Image
           source={require('../assets/image/header/right.png')}
           style={styles.rightIcon}
           resizeMode="contain"
         />
       </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
    paddingTop: height * 0.015,
    height: height * 0.1,
     overflow: 'hidden',
     backgroundColor:'#ddd'
  },
  
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  leftIcon: {
    width: 40,
    height: 40,
  },
    title: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color:'darkgreen'
  },

  rightIcon: {
    width: 32,
    height: 32,
  },
});

export default Header;
