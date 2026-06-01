import { TouchableOpacity, StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

export default function Header3() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.header}>
      <View style={styles.subHeader}>
        <View style={styles.left}>

          <Image
            source={require('../assets/images/icon.png')}
            style={styles.leftIcon}
          />
        </View>

        <View style={styles.right}>

          <Image
            source={require('../assets/header/right.png')}
            style={styles.rightIcon}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.dispatch(DrawerActions.openDrawer())
            }
          >
                  <Ionicons name="menu" size={28} color='darkgreen'/>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    paddingTop: 55,
    backgroundColor: "hsl(0, 0%, 95%)",
  },
  subHeader:{
    flexDirection:'row',
    justifyContent: "space-between",
    paddingHorizontal:18

  },
  left: {
    flexDirection: 'row',
  },
  right: {
    flexDirection: 'row',
      alignSelf:'center',
    gap:10
  },
  button: {
    borderRadius:6,
    alignSelf:'center',
  },

 leftIcon: {
    width: 33,
    height: 33,
    resizeMode: 'contain',
    borderWidth:1,
    borderRadius:200
  },
  rightIcon: {

    width: 30,
    height: 30,
    resizeMode: 'contain'
  },
});