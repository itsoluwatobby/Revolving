import { createContext, useState } from 'react';
import useSwr from 'swr';
import { PostType, ChildrenProp, PostContextType } from '../posts';
import { toast } from 'react-hot-toast';
import { posts_endPoint as cacheKey } from '../api/axiosPost'

import {  
  getPosts,  
  deletePost } from '../api/axiosPost';
import {  
  deletePostOptions, 
} from '../api/postApiOptions';

export const PostContext = createContext<PostContextType | null>(null)

export const PostDataProvider = ({ children }: ChildrenProp) => {
  const {
    data: posts,
    isLoading,
    error,
    mutate
  } = useSwr<PostType[]>(cacheKey, getPosts, {
    onSuccess: data => data?.sort((a, b) => {
      //const timeDiffrence = b?.date.localeCompare(a?.date);
      const likes = b?.likes - a?.likes;
      //const dayDifference = timeDiffrence / (1000 * 3000 * 24);
      return likes
    }),
  })
  const [postData, setPostData] = useState<Partial<PostType>>({
    title: undefined, body: undefined, author: 'anonymous'
  })
  const [search, setSearch] = useState<string>('');
  const [typingEvent, setTypingEvent] = useState<boolean>(false);
  const [canPost, setCanPost] = useState<boolean>(false);

  const deletePosts = async (id: string) => {
    try{
        await mutate(
          deletePost(id),
          deletePostOptions(id)
        )

        toast.success('Success!! Post deleted', {
          duration: 1000, icon: '🔥',  style: {
            background: '#32CD32'
          }
        })
    }
    catch(error){
      toast.error('Failed!! to delete', {
        duration: 1000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  const value = {
    postData, setPostData, search, setSearch, posts, isLoading, error, deletePosts, typingEvent, setTypingEvent, canPost, setCanPost
  }

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  )
}