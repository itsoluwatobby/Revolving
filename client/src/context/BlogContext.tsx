import { createContext, useEffect, useState } from 'react';
import { PostType, ChildrenProp, PostContextType } from '../posts';

export const PostContext = createContext<PostContextType | null>(null)

export const PostDataProvider = ({ children }: ChildrenProp) => {
  const [search, setSearch] = useState<string>('');
  const [filteredStories, setFilterStories] = useState<PostType[]>([])
  const [typingEvent, setTypingEvent] = useState<boolean>(false);
  const [canPost, setCanPost] = useState<boolean>(false);
  const [navPosts, setNavPosts] = useState<PostType[]>([])

  useEffect(() => {
    const filtered = navPosts?.filter(post => {
      return (
        post?.title?.toLowerCase().includes(search?.toLowerCase()) || post?.body?.toLowerCase().includes(search?.toLowerCase())
      )
    }) as PostType[]
    setFilterStories(filtered)
  }, [search, navPosts])

  const value = {
    filteredStories, search, setSearch, typingEvent, setTypingEvent, canPost, setCanPost, navPosts, setNavPosts
  }

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  )
}