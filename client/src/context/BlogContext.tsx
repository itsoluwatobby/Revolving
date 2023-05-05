import { createContext, useEffect, useState } from 'react';
import useSwr from 'swr';
import { PostType, ChildrenProp, PostContextType } from '../posts';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { posts_endPoint as cacheKey } from '../api/axiosPost'
import { sub } from 'date-fns';
import { useParams } from 'react-router-dom';

import { 
  createPost, 
  getPosts, 
  //updatePost, 
  deletePost } from '../api/axiosPost';
import { 
  addPostOptions, 
  deletePostOptions, 
  //updatePostOptions 
} from '../api/postApiOptions';

export const PostContext = createContext<PostContextType | null>(null)

export const PostDataProvider = ({ children }: ChildrenProp) => {
  const {
    data: posts,
    isLoading,
    error,
    mutate
  } = useSwr<PostType[], boolean>(cacheKey, getPosts, {
    onSuccess: data => data?.sort((a, b) => b?.date.localeCompare(a?.date)),
  })
  const [postData, setPostData] = useState<Partial<PostType>>({
    title: undefined, body: undefined, author: 'anonymous'
  })
  const [search, setSearch] = useState<string>('');
  const { postId } = useParams()

  const targetPost = posts?.find(pos => pos?.postId == postId)

  useEffect(() => {
    const dateTime = sub(new Date, { minutes: 0 }).toISOString();
    setPostData({
        postId, 
        title: targetPost?.title, 
        body: targetPost?.body,
        editDate: dateTime,
        fontFamily: targetPost?.fontFamily
    })
  }, [postId, targetPost])

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
          duration: 1000, icon: '🔥'
        })
        return true
    }
    catch(error){
      toast.error('Failed!! to add new post', {
        duration: 1000, icon: '💀'
      })
      return false
    }
  }
  const updatedPost = async () => {
    // const editedPost = {
    //   postId : uuidv4(),
    //   title: editTitle,
    //   body: editBody,
    //   date: Date.now().toLocaleString(),
    //   author: author || 'anonymous'
    // } as PostType
    try{
        await mutate(
          // updatePost(editedPost),
          // updatePostOptions(editedPost)
        )

        toast.success('Success!! Post editted', {
          duration: 1000, icon: '🔥'
        })
    }
    catch(error){
      toast.error('Failed!! to edit post', {
        duration: 1000, icon: '💀'
      })
    }
  }

  const deletePosts = async (postId: string) => {
    try{
        await mutate(
          deletePost(postId),
          deletePostOptions(postId)
        )

        toast.success('Success!! Post deleted', {
          duration: 1000, icon: '🔥'
        })
    }
    catch(error){
      toast.error('Failed!! to delete', {
        duration: 1000, icon: '💀'
      })
    }
  }

  const value = {
    postData, setPostData, search, setSearch, posts, isLoading, error, addPost, deletePosts, updatedPost
  }

  return (
    <PostContext.Provider value = {value}>
      {children}
    </PostContext.Provider>
  )
}