import { createContext, useState } from 'react';
import useSwr from 'swr';
import { PostType, ChildrenProp, PostContextType } from '../posts';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { posts_endPoint as cacheKey } from '../api/axiosPost'
import { sub } from 'date-fns';

import { 
  createPost, 
  getPosts, 
  updatePost, 
  deletePost } from '../api/axiosPost';
import { 
  addPostOptions, 
  deletePostOptions, 
  updatePostOptions 
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

  const addPost = async () => {
    const dateTime = sub(new Date, { minutes: 0 }).toISOString();
    const newPost = {
      postId : uuidv4(),
      date: dateTime,
      ...postData,
    } as PostType
  
    try{
        await mutate(
          createPost(newPost),
          addPostOptions(newPost)
        )
        toast.success('Success!! Post added', {
          duration: 1000, icon: '🔥', style: {
            background: '#32CD32'
          }
        })
    }
    catch(err){
      toast.error('Failed!! to add new post', {
        duration: 1000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  const updatedPost = async () => {
    const postUpdated = {...postData} as PostType;
    console.log(postUpdated)
    try{
        await mutate(
          updatePost(postUpdated),
          updatePostOptions(postUpdated)
        )

        toast.success('Success!! Post editted', {
          duration: 1000, icon: '🔥', style: {
            background: '#32CD32'
          }
        })
    }
    catch(err){
      toast.error('Failed!! to update post', {
        duration: 1000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

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
    postData, setPostData, search, setSearch, posts, isLoading, error, addPost, deletePosts, updatedPost, typingEvent, setTypingEvent, canPost, setCanPost
  }

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  )
}