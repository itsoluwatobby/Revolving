import { EnlargeCompo, Status, UserFriends } from '../data';
import { createContext, useState } from 'react';
import { ChatOption, ChildrenProp, ConflictType, FontStyle, EditingProp, Theme, ThemeContextType, UpdateSuccess, IsIntersectingType, ImageTypeProp } from '../posts';

export const ThemeContext = createContext<ThemeContextType | null>(null)

const initCurrentChat = {
  _id: '', status: 'online' as Status,
  lastName: '', lastSeen: '',
  firstName: '', displayPicture: ''
}
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
  const [openNotification, setOpenNotification] = useState<ChatOption>('Hide');

  const [parseId, setParseId] = useState<string>('');
  const [codeEditor, setCodeEditor] = useState<boolean>(false);
  const [success, setSuccess] = useState<UpdateSuccess>({
    codeId: '', res: false
  });
  
  const [isPresent, setIsPresent] = useState<ConflictType>({codeId: '', present: false});
  const [openEditPage, setOpenEditPage] = useState<ChatOption>('Hide');
  const [revealEditModal, setRevealEditModal] = useState<ImageTypeProp>('NIL');

  const [currentChat, setCurrentChat] = useState<UserFriends>(initCurrentChat);

  const [editing, setEditing] = useState<EditingProp>({editing: false, codeId: ''});
  const [notintersecting, setNotIntersecting] = useState<IsIntersectingType>('NOT_INTERSECTING')
  const [enlarge, setEnlarge] = useState<EnlargeCompo>({type: 'enlarge', assert: false});

  const values = {
    theme, fontFamily, openChat, enlarge, codeEditor, rollout, fontOption, openNotification, parseId, loginPrompt, toggleLeft, notintersecting, isPresent, editing, success, openEditPage, revealEditModal, currentChat, setCurrentChat, setTheme, setRevealEditModal, setOpenEditPage, setSuccess, setEditing, setIsPresent, setNotIntersecting, setToggleLeft, setRollout, setLoginPrompt, setFontOption, setParseId, setOpenNotification,  setCodeEditor, setEnlarge, setOpenChat, setFontFamily
  }
  return (
    <ThemeContext.Provider value={ values }>
      {children}
    </ThemeContext.Provider>
  )
}
