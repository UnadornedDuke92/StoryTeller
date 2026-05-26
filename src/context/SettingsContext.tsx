import React, { createContext, useContext, useState } from 'react';

export type Settings = {
  haptics: boolean;
  sound: boolean;
  planeViz: boolean;
  highQuality: boolean;
};

const DEFAULTS: Settings = {
  haptics: true,
  sound: true,
  planeViz: false,
  highQuality: false,
};

type SettingsCtx = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsCtx>({
  settings: DEFAULTS,
  update: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const update = (patch: Partial<Settings>) =>
    setSettings(prev => ({ ...prev, ...patch }));
  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
