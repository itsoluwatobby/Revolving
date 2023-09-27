import { EnlargeCompo } from '../data';
import { createContext, useState } from 'react';
import { ChatOption, ChildrenProp, CommentOptionProp, ConflictType, FontStyle, EditingProp, Theme, ThemeContextType, UpdateSuccess, IsIntersectingType, ImageTypeProp } from '../posts';

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
  const [codeEditor, setCodeEditor] = useState<boolean>(false);
  const [success, setSuccess] = useState<UpdateSuccess>({
    codeId: '', res: false
  });
  
  const [isPresent, setIsPresent] = useState<ConflictType>({codeId: '', present: false});
  const [openEditPage, setOpenEditPage] = useState<ChatOption>('Hide');
  const [revealEditModal, setRevealEditModal] = useState<ImageTypeProp>('NIL');

  const [editing, setEditing] = useState<EditingProp>({editing: false, codeId: ''});
  const [notintersecting, setNotIntersecting] = useState<IsIntersectingType>('NOT_INTERSECTING')
  const [enlarge, setEnlarge] = useState<EnlargeCompo>({type: 'enlarge', assert: false});

  const changeTheme = (mode: string) => {
    setTheme(prev => {
      return prev == 'light' ? 'dark' : 'light'
    })
    localStorage.setItem('theme', mode);
  }

  const values = {
    theme, fontFamily, openChat, enlarge, codeEditor, rollout, fontOption, openComment, parseId, loginPrompt, toggleLeft, notintersecting, isPresent, editing, success, openEditPage, revealEditModal, setRevealEditModal, setOpenEditPage, setSuccess, setEditing, setIsPresent, setNotIntersecting, setToggleLeft, setRollout, setLoginPrompt, setFontOption, setParseId, setOpenComment,  setCodeEditor, setEnlarge, setOpenChat, setFontFamily, changeTheme
  }
  return (
    <ThemeContext.Provider value={ values }>
      {children}
    </ThemeContext.Provider>
  )
}
