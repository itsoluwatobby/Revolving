// @types.posts.ts
import React from 'react';

export type ChildrenProp = {
  children: React.ReactNode
}

export type CommentType = {
  postId: string,
  commentId : string,
  date: string,
  body?: string,
  likes?: number,
  author: string | 'anonymous'
}

export type PostType = {
  postId: string,
  title: string,
  date: string,
  editDate?: string,
  body: string,
  likes?: number,
  fontFamily?: string | 'sans',
  // search?: string,
  // setSearch?: React.Dispatch<React.SetStateAction<Partial<PostType>>>,
  comment?: CommentType,
  author: string | 'anonymous'
}


export type PostContextType = {
  search: string,
  posts: PostType[],
  postData: Partial<PostType>,
  isLoading: boolean,
  error: { message: string },
  setSearch: React.Dispatch<React.SetStateAction<string>>
  setPostData: React.Dispatch<React.SetStateAction<Partial<PostType>>>,
  // getPosts: () => void,
  addPost: () => boolean,
  updatedPost: (postId: number) => void,
  deletePosts: (postId: number) => void,
}

export type Theme = 'light' | 'dark';
export type FontStyle = string | 'font_style';

export type ThemeContextType = {
  theme: Theme,
  fontFamily: FontStyle,
  fontOption: boolean,
  canPost: boolean, 
  //setCanPost: React.Dispatch<React.SetStateAction<boolean>>
  changeTheme: (mode: string) => void,
  changeFontFamily: (font: string) => void,
  // canPublish: (...args: string[]) => void,
  setFontOption: React.Dispatch<React.SetStateAction<boolean>>
}

