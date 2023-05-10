import { CONSTANTS } from '@shared/constants';
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useIpcRender } from '@/hooks';

const {
  theme: { variants },
  channels,
} = CONSTANTS;

export type ThemeState = typeof variants.DARK | typeof variants.LIGHT;

export type ThemeContextData = {
  theme?: ThemeState;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { send, data, receivedFirstResponse } = useIpcRender<string>({
    get: channels.GET_THEME,
    set: channels.SET_THEME,
  });

  const [theme, setTheme] = useState<ThemeState>();

  const { documentElement: html } = document;

  const addDarkClass = useCallback(() => {
    html.classList.add(variants.DARK);
  }, [html.classList]);

  const removeDarkClass = useCallback(() => {
    html.classList.remove(variants.DARK);
  }, [html.classList]);

  const toggleTheme = useCallback(() => {
    setTheme((state) => {
      if (state === variants.LIGHT) {
        addDarkClass();
        send(variants.DARK);
        return variants.DARK;
      } else {
        removeDarkClass();
        send(variants.LIGHT);
        return variants.LIGHT;
      }
    });
  }, [addDarkClass, removeDarkClass, send]);

  useEffect(() => {
    if (receivedFirstResponse) {
      setTheme(() => {
        if (data) {
          if (data === variants.DARK) {
            addDarkClass();
            return variants.DARK;
          } else {
            removeDarkClass();
            return variants.LIGHT;
          }
        } else if (
          window.matchMedia(`(prefers-color-scheme: ${variants.DARK})`).matches
        ) {
          addDarkClass();
          return variants.DARK;
        } else {
          removeDarkClass();
          return variants.LIGHT;
        }
      });
    }
  }, [addDarkClass, data, receivedFirstResponse, removeDarkClass]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
