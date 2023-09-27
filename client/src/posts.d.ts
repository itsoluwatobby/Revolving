// @types.posts.ts
import React from 'react';

type ChildrenProp = {
  children: React.ReactNode
}

type Categories = 'General' | 'Entertainment' | 'Web Development' | 'React' | 'Node' | 'Bash scripting'
type IsIntersectingType = 'INTERSECTING' | 'NOT_INTERSECTING'

type MakeToButtom = PostType & Pick<SharedProps, 'sharedLikes'>
type CodeProps =  { 
  _id?: string,
  body: string,
  codeId?: string,
  language: string,
  createdAt: string,
  updatedAt: string, 
}

type PostType = {
  _id: string,
  userId: string,
  title: string,
  picture: string[],
  body: string,
  author: string | 'anonymous',
  likes: string[],
  isShared?: string[],
  category: Categories[],
  fontFamily?: string | 'sans',
  commentIds?: string[],
  code: CodeProps[],
  edited: boolean,
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
  submitToSend: CodeProps[],
  inputValue: CodeStoreType,
  codeStore: CodeStoreType[],
  filteredStories: PostType[],
  setSearch: React.Dispatch<React.SetStateAction<string>>,
  setCanPost: React.Dispatch<React.SetStateAction<boolean>>,
  setNavPosts: React.Dispatch<React.SetStateAction<PostType[]>>,
  setTypingEvent: React.Dispatch<React.SetStateAction<TypingEvent>>,
  setImagesFiles: React.Dispatch<React.SetStateAction<ImageType[]>>,
  setSubmitToSend: React.Dispatch<React.SetStateAction<CodeProps[]>>,
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
  openComment: CommentOptionProp,
  revealEditModal: ImageTypeProp, 
  notintersecting: IsIntersectingType,
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
  setOpenComment: React.Dispatch<React.SetStateAction<CommentOptionProp>>,
  setRevealEditModal: React.Dispatch<React.SetStateAction<ImageTypeProp>>,
  setNotIntersecting: React.Dispatch<React.SetStateAction<IsIntersectingType>>
}
