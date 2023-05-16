//import { useState, useEffect } from 'react';
import { PostContextType } from '../posts'
import { SkeletonBlog } from './skeletons/SkeletonBlog';
import { Post } from './Post';
import { usePostContext } from '../hooks/usePostContext';
//import { EditPost } from './EditPost';

//import { usePostContext } from '../hooks/usePostContext'

export const Posts = () => {
  const { isLoading, error, posts } = usePostContext() as PostContextType
  
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
          <Post key={post?._id} post={post} />
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