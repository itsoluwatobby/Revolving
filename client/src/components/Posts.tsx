//import { useState, useEffect } from 'react';
import { PostContextType, PostType, ThemeContextType } from '../posts'
import { SkeletonBlog } from './skeletons/SkeletonBlog';
import { Post } from './Post';
import { RiSignalWifiErrorLine } from 'react-icons/ri'
import { usePostContext } from '../hooks/usePostContext';
import { useEffect, useState } from 'react';
import { Categories } from '../data';
import useSwrMutation from 'swr/mutation'
import { posts_endPoint as cacheKey, postAxios } from '../api/axiosPost';
import Comments from './comments/Comments';
import { useThemeContext } from '../hooks/useThemeContext';

type PostsProps = {
  navigationTab: Categories
}

export const Posts = ({ navigationTab }: PostsProps) => {
  const {
    trigger,
    isMutating,
    error: isError
  } = useSwrMutation(cacheKey, async(): Promise<PostType[]> => {
    const res = await postAxios.get(`${cacheKey}/category?category=${navigationTab}`)
    return res?.data?.data
  }, {
    onSuccess: data => data?.sort((a, b) => b?.storyDate.localeCompare(a?.storyDate)),
    revalidate: true
  })
  const { filteredStories, setNavPosts } = usePostContext() as PostContextType
  const { openComment } = useThemeContext() as ThemeContextType

  //(b?.sharedDate.localeCompare(a?.sharedDate))
  useEffect(() => {
    let isMounted = true;
    const triggerCategory = async() =>{
      const res = await trigger()
      setNavPosts(res as PostType[])
    }
    isMounted && triggerCategory()

    return () => {
      isMounted = false
    }
  }, [navigationTab, trigger, setNavPosts])
  
  let content;

  isMutating ? content = (
    [...Array(10).keys()].map(index => (
        <SkeletonBlog key={index} />
        )
      )
  ) 
  : isError ? content = <p className='flex flex-col gap-5 items-center text-3xl text-center text-red-400'>
    {isError?.message}
    <RiSignalWifiErrorLine className='text-6xl text-gray-600' />
    </p> 
  :(
    filteredStories?.length ? content = (
      filteredStories?.map(post => (
            <Post key={post?.sharedId || post?._id} post={post as PostType} />
          )
        )
      ) 
      : content = (<p className='m-auto text-3xl capitalize font-mono text-gray-400'>No stories available</p>)
  )
  return (
    <div className='relative box-border max-w-full flex-auto flex flex-col gap-2 drop-shadow-2xl pb-5'>
      {openComment ? <Comments /> : content }
    </div>
  )
}

//w-[58%]