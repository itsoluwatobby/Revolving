// @types.posts.ts
import React from 'react';

export type ChildrenProp = {
  children: React.ReactNode
}

export type CommentType = {
  postId: string,
  id : string,
  date: string,
  body?: string,
  likes?: number,
  author: string | 'anonymous'
}

export type PostType = {
  id : string,
  title: string,
  date: string,
  body: string,
  likes?: number,
  fontFamily?: string | 'sans',
  // search?: string,
  // setSearch?: React.Dispatch<React.SetStateAction<Partial<PostType>>>,
  comment?: CommentType,
  author: string | 'anonymous'
}


export type PostContextType = {
  posts: PostType[],
  getPosts: () => void,
  addPost: () => void,
  updatePost: (id: number) => void,
  deletePost: (id: number) => void,
}

export type Theme = 'light' | 'dark';
export type FontStyle = string | 'font_style';

export type ThemeContextType = {
  theme: Theme,
  fontFamily: FontStyle,
  fontOption: boolean,
  changeTheme: (mode: string) => void,
  changeFontFamily: (font: string) => void,
  setFontOption: React.Dispatch<React.SetStateAction<boolean>>
}

