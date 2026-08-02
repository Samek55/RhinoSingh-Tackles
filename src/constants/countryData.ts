import { area as chennaiAreas, city as indiaCities } from '../data/Data';
import { kathmanduAreas, bhaktapurAreas, lalitpurAreas } from '../data/NepalAreaData';

const chennaiMapImage = require('../../assets/images/chennai.jpg');
const nepalMapImage = require('../../assets/otherImages/map-kamalpokhari.png');

export type CountryCode = 'india' | 'nepal';

export interface CountryInfo {
  code: CountryCode;
  label: string;
  flag: string;
  cityTagline: string;
  address: string;
  dialCode: string;
  phone?: string;
  contactPhone?: string;
  mapUrl: string;
  mapImage: number;
  cities: string[];
  areasByCity: Record<string, string[]>;
}

// Local convention for this contact number is "98520 25 735" (5-2-3 grouping),
// not the usual 3-3-4 phone grouping — keep it consistent everywhere it's shown.
export function formatLocalPhone(digits: string): string {
  if (digits.length !== 10) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
}

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  india: {
    code: 'india',
    label: 'India',
    flag: '🇮🇳',
    cityTagline: 'On Demand Home Service in Chennai',
    address: 'LLTM, Bartaprak, PIN-SPAN 2026, Chennai, India.',
    dialCode: '+91',
    mapUrl: 'https://maps.app.goo.gl/araE5tx5DdGJnA3u5',
    mapImage: chennaiMapImage,
    cities: indiaCities,
    areasByCity: {
      Chennai: chennaiAreas,
      Other: ['Other'],
    },
  },
  nepal: {
    code: 'nepal',
    label: 'Nepal',
    flag: '🇳🇵',
    cityTagline: 'On Demand Home Service in Kathmandu',
    address: 'Rem.Work, Kamalpokhari, Kathmandu, Nepal',
    dialCode: '+977',
    phone: '9852025735',
    contactPhone: '9852024365',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('SRIYOG, Kamalpokhari, Kathmandu, Nepal'),
    mapImage: nepalMapImage,
    cities: ['Kathmandu', 'Bhaktapur', 'Lalitpur', 'Other'],
    areasByCity: {
      Kathmandu: kathmanduAreas,
      Bhaktapur: bhaktapurAreas,
      Lalitpur: lalitpurAreas,
      Other: ['Other'],
    },
  },
};
