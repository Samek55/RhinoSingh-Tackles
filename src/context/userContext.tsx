import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextType {
  userCity: string | null;
  userType: string | null;
  userProfession: string | null;
  setUserData: (city: string, type: string, profession: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userCity, setUserCity] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [userProfession, setUserProfession] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const city = await AsyncStorage.getItem('userCity');
    const type = await AsyncStorage.getItem('userType');
    const profession = await AsyncStorage.getItem('userProfession');
    
    setUserCity(city);
    setUserType(type);
    setUserProfession(profession);
  };

  const setUserData = (city: string, type: string, profession: string) => {
    setUserCity(city);
    setUserType(type);
    setUserProfession(profession);
    AsyncStorage.setItem('userCity', city);
    AsyncStorage.setItem('userType', type);
    AsyncStorage.setItem('userProfession', profession);
  };

  return (
    <UserContext.Provider value={{ userCity, userType, userProfession, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};