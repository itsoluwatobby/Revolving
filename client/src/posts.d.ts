// @types.posts.ts
import React from 'react';

type ChildrenProp = {
  children: React.ReactNode
}
  
type PostType = {
  _id: string,
  userId: string,
  title: string,
  picture: string,
  body: string,
  author: string | 'anonymous',
  storyDate: string,
  likes: string[],
  isShared?: string[],
  category: Categories[] | Categories,
  fontFamily?: string | 'sans',
  commentIds?: string[],
  edited: false,
  editDate: string,
  sharedDate: string,
  sharerId?: string,
  sharedId?: string,
  sharedLikes?: string[]
}

// interface WindowScrollType{
//   Xscroll: number, Yscroll: number
// }


type PostContextType = {
  search: string,
  posts?: PostType[],
  postData: Partial<PostType>,
  filteredStories: PostType[],
  isLoading: boolean,
  typingEvent: boolean,
  error?: {message: string, name: string, code: string},
  // editPost: Partial<PostType>, 
  canPost: boolean,
  navPosts: PostType[], 
  setNavPosts: React.Dispatch<React.SetStateAction<PostType[]>>,
  setCanPost: React.Dispatch<React.SetStateAction<boolean>>
  setSearch: React.Dispatch<React.SetStateAction<string>>
  setTypingEvent: React.Dispatch<React.SetStateAction<boolean>>
  setPostData: React.Dispatch<React.SetStateAction<Partial<PostType>>>,
}

type Theme = 'light' | 'dark';
type FontStyle = string | 'font_style';

type ThemeContextType = {
  theme: Theme,
  fontFamily: FontStyle,
  fontOption: boolean,
  rollout: boolean,
  openComment: boolean,
  parseId: string,
  enlarge: boolean,
  changeTheme: (mode: string) => void,
  setEnlarge: React.Dispatch<React.SetStateAction<boolean>>,
  setParseId: React.Dispatch<React.SetStateAction<string>>,
  setOpenComment: React.Dispatch<React.SetStateAction<boolean>>,
  setFontOption: React.Dispatch<React.SetStateAction<boolean>>,
  setFontFamily: React.Dispatch<React.SetStateAction<string>>,
  setRollout: React.Dispatch<React.SetStateAction<boolean>>
}

