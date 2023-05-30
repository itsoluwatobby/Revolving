import { createContext, useEffect, useState } from 'react';
import useSwr from 'swr';
import { PostType, ChildrenProp, PostContextType } from '../posts';
import { posts_endPoint as cacheKey } from '../api/axiosPost'
import { getPosts } from '../api/axiosPost';

export const PostContext = createContext<PostContextType | null>(null)

export const PostDataProvider = ({ children }: ChildrenProp) => {
  const {
    data: posts,
    isLoading,
    error
  } = useSwr<PostType[]>(cacheKey, getPosts, {
    onSuccess: data => data?.sort((a, b) => {
      const timeDiffrence = b?.storyDate.localeCompare(a?.storyDate);
      // const likes = +b?.likes - +a?.likes;
      //const dayDifference = timeDiffrence / (1000 * 3000 * 24);
      return timeDiffrence
    }),
  })
  const [postData, setPostData] = useState<Partial<PostType>>({
    title: undefined, body: undefined, author: 'anonymous'
  })
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
    postData, filteredStories, setPostData, search, setSearch, posts, isLoading, error, typingEvent, setTypingEvent, canPost, setCanPost, navPosts, setNavPosts
  }

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  )
}