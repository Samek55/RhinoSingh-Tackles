import { TouchableOpacity, StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

export default function Header1() {
  const navigation = useNavigation<any>();

  return (
    <View>
      <Image
        source={require('../assets/images/icon.png')}
        style={styles.leftIcon}
      />
      <Image
        source={require('../assets/header/right.png')}
        style={styles.rightIcon}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.getParent()?.dispatch(DrawerActions.openDrawer())
        }
      >
        <Ionicons name="menu" size={28} color='#fff'/>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({

  button: {
    position: 'absolute',
    top: 35,
    right: 30,
    zIndex: 10,
  },

  leftIcon: {
    position: 'absolute',
    top: 35,
    left: 20,
    zIndex: 10,
    width: 33,
    height: 33,
    resizeMode: 'contain'
  },
   rightIcon: {
    position: 'absolute',
    top: 35,
    right: 70,
    zIndex: 10,
    width: 30,
    height: 30,
    resizeMode: 'contain'
  },
});