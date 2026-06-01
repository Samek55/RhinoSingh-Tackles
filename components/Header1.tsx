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
        <Ionicons name="menu" size={28} color='darkgreen'/>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({

  button: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },

  leftIcon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
    width: 57,
    height: 57,
    resizeMode: 'contain'
  },
   rightIcon: {
    position: 'absolute',
    top: 40,
    right: 55,
    zIndex: 10,
    padding: 10,
    width: 52,
    height: 52,
    resizeMode: 'contain'
  },
});