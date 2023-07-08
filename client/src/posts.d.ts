// @types.posts.ts
import React from 'react';

type ChildrenProp = {
  children: React.ReactNode
}

type MakeToButtom = PostType & Pick<SharedProps, 'sharedLikes'>
  
type PostType = {
  _id: string,
  userId: string,
  title: string,
  picture: string,
  body: string,
  author: string | 'anonymous',
  likes: string[],
  isShared?: string[],
  category: Categories[] | Categories,
  fontFamily?: string | 'sans',
  commentIds?: string[],
  edited: false,
  sharerId?: string,
  sharedId?: string,
  sharedLikes?: string[],
  createdAt: string,
  updatedAt: string
}

// interface WindowScrollType{
//   Xscroll: number, Yscroll: number
// }
type CodeStoreType = {
  codeId?: string,
  langType: string,
  code: string
}

type PostContextType = {
  search: string,
  url?: string,
  filteredStories: PostType[],
  typingEvent: boolean,
  canPost: boolean,
  navPosts: PostType[],
  inputValue: CodeStoreType,
  codeStore: CodeStoreType[],
  uploadToCloudinary: (image: File) => Promise<void>,
  setNavPosts: React.Dispatch<React.SetStateAction<PostType[]>>,
  setInputValue: React.Dispatch<React.SetStateAction<CodeStoreType>>,
  setCodeStore: React.Dispatch<React.SetStateAction<CodeStoreType[]>>,
  setCanPost: React.Dispatch<React.SetStateAction<boolean>>,
  setSearch: React.Dispatch<React.SetStateAction<string>>,
  setTypingEvent: React.Dispatch<React.SetStateAction<boolean>>
}

type PromptLiterals = 'Show' | 'Discard' | 'Retain' | 'Dommant'

type Theme = 'light' | 'dark';
type FontStyle = string | 'font_style';
type ChatOption = 'Hide' | 'Open';

type CommentOptionProp = { 
  option: ChatOption, 
  storyId: string
}

type EnlargeCompo = {
  type: 'open' | 'enlarge',
  assert: boolean
}

type ThemeContextType = {
  theme: Theme,
  fontFamily: FontStyle,
  fontOption: boolean,
  rollout: boolean,
  codeEditor: boolean,
  openComment: CommentOptionProp,
  parseId: string,
  enlarge: EnlargeCompo,
  openChat: ChatOption,
  toggleLeft: ChatOption,
  notintersecting: ChatOption, 
  loginPrompt: ChatOption,
  changeTheme: (mode: string) => void,
  setOpenChat: React.Dispatch<React.SetStateAction<ChatOption>>,
  setToggleLeft: React.Dispatch<React.SetStateAction<ChatOption>>,
  setLoginPrompt: React.Dispatch<React.SetStateAction<ChatOption>>,
  setEnlarge: React.Dispatch<React.SetStateAction<EnlargeCompo>>,
  setParseId: React.Dispatch<React.SetStateAction<string>>,
  setFontFamily: React.Dispatch<React.SetStateAction<string>>,
  setNotIntersecting: React.Dispatch<React.SetStateAction<ChatOption>>
  setOpenComment: React.Dispatch<React.SetStateAction<CommentOptionProp>>,
  setFontOption: React.Dispatch<React.SetStateAction<boolean>>,
  setRollout: React.Dispatch<React.SetStateAction<boolean>>,
  setCodeEditor: React.Dispatch<React.SetStateAction<boolean>>
}

