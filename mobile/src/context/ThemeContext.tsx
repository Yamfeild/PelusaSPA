import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: any) => {
  const deviceScheme = useColorScheme(); 
  const [isDarkMode, setIsDarkMode] = useState(deviceScheme === 'dark');

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);