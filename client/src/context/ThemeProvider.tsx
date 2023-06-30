import { createContext, useState } from 'react';
import { ChatOption, ChildrenProp, CommentOptionProp, FontStyle, Theme, ThemeContextType } from '../posts';
import { EnlargeCompo } from '../data';

export const ThemeContext = createContext<ThemeContextType | null>(null)

export const ThemeDataProvider = ({ children }: ChildrenProp) => {
  const [theme, setTheme] = useState<Theme>(localStorage.getItem('theme') as Theme || 'light');
  const [fontFamily, setFontFamily] = useState<FontStyle>(
    localStorage.getItem('fontFamily') || 'font_style'
    );
  const [openChat, setOpenChat] = useState<ChatOption>('Hide');
  const [loginPrompt, setLoginPrompt] = useState<ChatOption>('Hide');
  const [toggleLeft, setToggleLeft] = useState<ChatOption>('Hide')

  const [fontOption, setFontOption] = useState<boolean>(false);
  const [rollout, setRollout] = useState<boolean>(false);
  const [openComment, setOpenComment] = useState<CommentOptionProp>({ option: 'Hide', storyId: '' });

  const [parseId, setParseId] = useState<string>('');
  const [enlarge, setEnlarge] = useState<EnlargeCompo>({type: 'enlarge', assert: false});

  const changeTheme = (mode: string) => {
    setTheme(prev => {
      return prev == 'light' ? 'dark' : 'light'
    })
    localStorage.setItem('theme', mode);
  }

  const values = {
    theme, fontFamily, setFontFamily, changeTheme, rollout, setRollout, fontOption, openComment, parseId, loginPrompt, toggleLeft, setToggleLeft, setLoginPrompt, setFontOption, setParseId, setOpenComment, enlarge, setEnlarge, openChat, setOpenChat
  }
  return (
    <ThemeContext.Provider value={ values }>
      {children}
    </ThemeContext.Provider>
  )
}
