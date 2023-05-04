import useSwr from 'swr';
import { useState, useEffect } from 'react';
import { posts_endPoint as cacheKey } from '../api/axiosPost'
import { PostContextType, PostType } from '../posts'
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

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
import { SkeletonBlog } from './skeletons/SkeletonBlog';
import { Post } from './Post';
//import { EditPost } from './EditPost';

//import { usePostContext } from '../hooks/usePostContext'

export const Posts = () => {
  //const { setPosts } = usePostContext()
  const [postData, setPostData] = useState<Partial<PostType>>({
    title: '', body: '', author: '' || 'anonymous'
  })

  const {
    data: posts,
    isLoading,
    error,
    mutate
  } = useSwr(cacheKey, getPosts, {
    onSuccess: data => data.sort((a,b) => b?.date.localeCompare(a.date)),
  })
  const {title, body, author} = postData;

  const handleChange = e => {
    const name = e.target.name
    const value = e.target.value
    setPostData(() => {
      return {...postData, [name]: value}
    })
  }


//PostType, boolean, Error, KeyedMutator<PostType>
  const addPost = async () => {
    const newPost = {
      id : uuidv4(),
      title: title,
      body: body,
      date: Date.now().toLocaleString(),
      author: author || 'anonymous'
    } as PostType
    try{
        await mutate(
          createPost(newPost),
          addPostOptions(newPost)
        )

        toast.success('Success!! Post added', {
          duration: 1000, icon: '🔥'
        })
    }
    catch(error){
      toast.error('Failed!! to add new post', {
        duration: 1000, icon: '💀'
      })
    }
  }
  const updatedPost = async () => {
    const editedPost = {
      id : uuidv4(),
      title: editTitle,
      body: editBody,
      date: Date.now().toLocaleString(),
      author: author || 'anonymous'
    } as PostType
    try{
        await mutate(
          updatePost(editedPost),
          updatePostOptions(editedPost)
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
  const deletePosts = async (id: string) => {
    try{
        await mutate(
          deletePost(id),
          deletePostOptions(id)
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

  let content;

  isLoading ? content = (
    [...Array(10).keys()].map(index => (
        <SkeletonBlog key={index} />
        )
      )
  ) 
  : error ? content = <p>{error?.message}</p> 
  :(  posts?.length ? content = (
        posts?.map(post => (
          <Post key={post?.id} post={post} />
        )
      )
    ) 
    : content = (<p>No posts available</p>)
  )
  return (
    <div className='box-border max-w-full flex-auto flex flex-col gap-4 drop-shadow-2xl'>
      {content}
    </div>
  )
}

//w-[58%]