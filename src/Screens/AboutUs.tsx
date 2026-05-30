import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';

import OurTeamCard from '../components/home/OurTeamCard';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header from '../components/Header';

const AboutScreen = ({ }: { navigation: any }) => {
  return (
    <View style={{ flex: 1 }}>

      <Header />
      <FlatList
        data={[]}
        keyExtractor={() => 'about'}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        bounces={false}

        ListHeaderComponent={() => (
          <View style={styles.container}>



            {/* BANNER (optimized rendering) */}
            <View style={styles.banner}>
              <Image
                source={require('../assets/aboutUs/aboutUS.jpeg')}
                style={styles.bannerImage}
                resizeMode="cover"
                fadeDuration={0}
              />
            </View>

            {/* CONTENT */}
            <View style={styles.content}>

              <Text style={styles.title}>Our Story</Text>

              <Text style={styles.subtitle}>
                RocketSingh is the Indian version of TACKLES PRO — a growing
                platform delivering fast, reliable, and professional on-demand
                home services across India, powered by skilled and trained
                professionals available 24 hours a day, 365 days a year.
              </Text>

              <Text style={styles.lineheighpara}>
                Our mission is to connect customers with trusted experts
                anytime, anywhere — from emergency support to daily maintenance
                — under one convenient platform, eliminating the hassle of
                searching multiple providers.
              </Text>

              <Text style={styles.lineheighpara}>
                Our vision is to redefine modern service delivery by bringing
                technology-driven workforce solutions to homes, offices, and
                businesses throughout India, starting from Chennai.
              </Text>

              <Text style={styles.lineheighpara}>
                RocketSingh is a project of SRIYOG Consulting, incubated at
                IITM Pravartak, IN-SPAN 2026, Chennai, India.
              </Text>

              {/* TEAM */}
              <View style={{ height: 18 }} />

              <Text style={styles.title}>Our Team</Text>

              <View style={styles.row}>
                <OurTeamCard
                  image={require('../assets/topProfessionals/1_jamesWalker.jpg')}
                  title="James Walker"
                  suBTitle="Deep Cleaning Specialist"
                />

                <OurTeamCard
                  image={require('../assets/topProfessionals/2_michaelTurner.jpg')}
                  title="Michael Turner"
                  suBTitle="Pressure Washing Technician"
                />

                <OurTeamCard
                  image={require('../assets/topProfessionals/3_matthewKing.jpg')}
                  title="Matthew King"
                  suBTitle="Smart Home Installation Engineer"
                />
              </View>

            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  banner: {
    width: '90%',
    height: hp('30%'),
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 25,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
  },

  content: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2.5%'),
  },

  title: {
    fontSize: wp('5.2%'),
    color: '#064E3B',
    fontWeight: '900',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: wp('3.7%'),
    color: 'hsl(0, 0%, 15%)',
    fontWeight: '400',
    lineHeight: 19,
    marginTop: 10,
  },

  lineheighpara: {
    fontSize: wp('3.7%'),
    color: 'hsl(0, 0%, 15%)',
    fontWeight: '400',
    paddingTop: 8,
    lineHeight: 19,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: hp('0.5%'),
    marginBottom: '5%',
  },
});

export default AboutScreen;
