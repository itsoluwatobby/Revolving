import React, { createContext, useState } from 'react';
import { PostType, ChildrenProp } from '../posts';

type SearchProp = {
  search: string,
  setSearch: React.Dispatch<React.SetStateAction<string>>
}

export const PostContext = createContext<PostType | null>(null)

export const PostDataProvider = ({ children }: ChildrenProp) => {
  const [posts, setPosts] = useState<PostType[] | []>([]);
  const [search, setSearch] = useState<SearchProp | null>(null);

  const value = {
    posts, setPosts, search, setSearch
  }

  return (
    <PostContext.Provider value = {value}>
      {children}
    </PostContext.Provider>
  )
}