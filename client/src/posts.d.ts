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
  picture: string[],
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
  sharedAuthor?: string,
  sharedLikes?: string[],
  sharedDate?: string,
  createdAt: string,
  updatedAt: string
}

// interface WindowScrollType{
//   Xscroll: number, Yscroll: number
// }

type ImageType = {
  imageId: string,
  image: File
}

type ImageRes = { 
  data: { 
    url: string 
  }
}

type ImageUrlsType = {
  imageId: string,
  url: string
}

type CodeStoreType = {
  codeId?: string,
  langType: string,
  code: string,
  date: string
}

type TypingEvent = 'typing' | 'notTyping'

type PostContextType = {
  search: string,
  canPost: boolean,
  navPosts: PostType[],
  imagesFiles: ImageType[]
  typingEvent: TypingEvent,
  inputValue: CodeStoreType,
  codeStore: CodeStoreType[],
  filteredStories: PostType[],
  setSearch: React.Dispatch<React.SetStateAction<string>>,
  setCanPost: React.Dispatch<React.SetStateAction<boolean>>,
  setNavPosts: React.Dispatch<React.SetStateAction<PostType[]>>,
  setImagesFiles: React.Dispatch<React.SetStateAction<ImageType[]>>,
  setTypingEvent: React.Dispatch<React.SetStateAction<TypingEvent>>,
  setInputValue: React.Dispatch<React.SetStateAction<CodeStoreType>>,
  setCodeStore: React.Dispatch<React.SetStateAction<CodeStoreType[]>>,
}

type PromptLiterals = 'Show' | 'Discard' | 'Retain' | 'Dommant'

type Theme = 'light' | 'dark';
type ChatOption = 'Hide' | 'Open';
type FontStyle = string | 'font_style';
type ImageTypeProp = 'DP' | 'COVER' | 'NIL'
type NameType = 'photo' | 'coverPhoto' | null
type TargetImageType = {
  name: NameType, 
  data: File | null
}

type CommentOptionProp = { 
  option: ChatOption, 
  storyId: string
}

type EnlargeCompo = {
  type: 'open' | 'enlarge',
  assert: boolean
}

type ConflictType = {
  codeId: string,
  present: boolean
}

type EditingProp = {
  editing: boolean,
  codeId: string,
  code?: string,
  type?: 'DELETE' | 'EDIT' | 'NIL'
}

type UpdateSuccess={
  codeId: string,
  res: boolean
}

type ThemeContextType = {
  theme: Theme,
  parseId: string,
  rollout: boolean,
  fontOption: boolean,
  codeEditor: boolean,
  editing: EditingProp,
  openChat: ChatOption,
  enlarge: EnlargeCompo,
  fontFamily: FontStyle,
  toggleLeft: ChatOption,
  success: UpdateSuccess,
  isPresent: ConflictType,
  loginPrompt: ChatOption,
  openEditPage: ChatOption,
  notintersecting: ChatOption, 
  openComment: CommentOptionProp,
  changeTheme: (mode: string) => void,
  setParseId: React.Dispatch<React.SetStateAction<string>>,
  setRollout: React.Dispatch<React.SetStateAction<boolean>>,
  setFontFamily: React.Dispatch<React.SetStateAction<string>>,
  setFontOption: React.Dispatch<React.SetStateAction<boolean>>,
  setCodeEditor: React.Dispatch<React.SetStateAction<boolean>>,
  setEditing: React.Dispatch<React.SetStateAction<EditingProp>>,
  setOpenChat: React.Dispatch<React.SetStateAction<ChatOption>>,
  setEnlarge: React.Dispatch<React.SetStateAction<EnlargeCompo>>,
  setToggleLeft: React.Dispatch<React.SetStateAction<ChatOption>>,
  setSuccess: React.Dispatch<React.SetStateAction<UpdateSuccess>>,
  setLoginPrompt: React.Dispatch<React.SetStateAction<ChatOption>>,
  setIsPresent: React.Dispatch<React.SetStateAction<ConflictType>>,
  setOpenEditPage: React.Dispatch<React.SetStateAction<ChatOption>>,
  setNotIntersecting: React.Dispatch<React.SetStateAction<ChatOption>>
  setOpenComment: React.Dispatch<React.SetStateAction<CommentOptionProp>>,
}
