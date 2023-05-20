//import { useState, useEffect } from 'react';
import { PostContextType, PostType } from '../posts'
import { SkeletonBlog } from './skeletons/SkeletonBlog';
import { Post } from './Post';
import { RiSignalWifiErrorLine } from 'react-icons/ri'
import { usePostContext } from '../hooks/usePostContext';
import { useEffect, useState } from 'react';

type PostsProps = {
  navigationTab: string
}

export const Posts = ({ navigationTab }: PostsProps) => {
  const { isLoading, error, filteredStories } = usePostContext() as PostContextType
  const [navPosts, setNavPosts] = useState<PostType[]>([])
  
  useEffect(() => {
    setNavPosts(
        filteredStories?.filter(post => post?.category == navigationTab) as PostType[]
      )
    console.log('changed..')
  }, [navigationTab, filteredStories])
  
  let content;

  isLoading ? content = (
    [...Array(10).keys()].map(index => (
        <SkeletonBlog key={index} />
        )
      )
  ) 
  : error ? content = <p className='flex flex-col gap-5 items-center text-3xl text-center text-red-400'>
    {error?.message}
    <RiSignalWifiErrorLine className='text-6xl text-gray-600' />
    </p> 
  :(  navPosts?.length ? content = (
        navPosts?.map(post => (
          <Post key={post?._id} post={post as PostType} />
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