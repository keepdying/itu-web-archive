import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7, SettingsBrightness } from '@mui/icons-material'; // Icons
import { useThemeContext, ThemeSetting } from '@/contexts/ThemeContext';

const ThemeToggleButton: React.FC = () => {
  const { themeSetting, setThemeSetting } = useThemeContext();

  const handleThemeChange = () => {
    let nextSetting: ThemeSetting;
    if (themeSetting === 'light') {
      nextSetting = 'dark';
    } else if (themeSetting === 'dark') {
      nextSetting = 'auto';
    } else { // auto
      nextSetting = 'light';
    }
    setThemeSetting(nextSetting);
  };

  let IconComponent;
  let title = '';

  if (themeSetting === 'light') {
    IconComponent = Brightness7;
    title = 'Switch to Dark Mode';
  } else if (themeSetting === 'dark') {
    IconComponent = SettingsBrightness; // Icon for "auto" when current is dark
    title = 'Switch to Auto Mode';
  } else { // auto
    IconComponent = Brightness4;
    title = 'Switch to Light Mode';
  }

  return (
    <Tooltip title={title}>
      <IconButton onClick={handleThemeChange} color="inherit">
        <IconComponent />
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton; 