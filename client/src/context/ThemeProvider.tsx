import { createContext, useState } from 'react';
import { ChildrenProp, FontStyle, Theme, ThemeContextType } from '../posts';

export const ThemeContext = createContext<ThemeContextType | null>(null)

export const ThemeDataProvider = ({ children }: ChildrenProp) => {
  const [theme, setTheme] = useState<Theme>(localStorage.getItem('theme') as Theme || 'light');
  const [fontFamily, setFontFamily] = useState<FontStyle>(
    localStorage.getItem('fontFamily') || 'font_style'
    );
  const [fontOption, setFontOption] = useState<boolean>(false);
  const [rollout, setRollout] = useState<boolean>(false);

  const changeTheme = (mode: string) => {
    setTheme(prev => {
      return prev == 'light' ? 'dark' : 'light'
    })
    localStorage.setItem('theme', mode);
  }

  const changeFontFamily = (font: string) => {
    setFontFamily(font)
    localStorage.setItem('fontFamily', font);
  }

  const values = {
    theme, fontFamily, changeTheme, rollout, setRollout, changeFontFamily, fontOption, setFontOption
  }
  return (
    <ThemeContext.Provider value={ values }>
      {children}
    </ThemeContext.Provider>
  )
}
