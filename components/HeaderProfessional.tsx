import { StyleSheet, View, Image, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Professional-facing screens (login, leads, pay-to-unlock) aren't part of the
// drawer navigation flow the way staff/customer screens are — no hamburger
// menu here, just the brand mark and an optional subtitle for context (e.g.
// "My Leads", "Login").
export default function HeaderProfessional({ subtitle }: { subtitle?: string }) {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#064E3B" />
      <LinearGradient
        colors={['#064E3B', '#064E3B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.row}>
          <Image source={require('../assets/images/icon.png')} style={styles.icon} />
          <View>
            <Text style={styles.title}>RocketSingh</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    paddingTop: 45,
    paddingBottom: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 39,
    height: 39,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginTop: -2,
  },
});
