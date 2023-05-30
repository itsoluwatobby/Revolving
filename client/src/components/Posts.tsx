//import { useState, useEffect } from 'react';
import { PostContextType, PostType } from '../posts'
import { SkeletonBlog } from './skeletons/SkeletonBlog';
import { Post } from './Post';
import { RiSignalWifiErrorLine } from 'react-icons/ri'
import { usePostContext } from '../hooks/usePostContext';
import { useEffect, useState } from 'react';
import { Categories } from '../data';
import useSwrMutation from 'swr/mutation'
import { posts_endPoint as cacheKey, postAxios } from '../api/axiosPost';
import { NAVIGATE } from '../assets/navigator';

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
    onSuccess: data => data?.sort((a, b) => b?.storyDate.localeCompare(a?.storyDate))
  })
  const { error, filteredStories, setNavPosts } = usePostContext() as PostContextType
  
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
  : (error || isError) ? content = <p className='flex flex-col gap-5 items-center text-3xl text-center text-red-400'>
    {error?.message}
    <RiSignalWifiErrorLine className='text-6xl text-gray-600' />
    </p> 
  :(  filteredStories?.length ? content = (
    filteredStories?.map(post => (
          <Post key={post?._id} post={post as PostType} />
        )
      )
    ) 
    : content = (<p>No posts available</p>)
  )
  return (
    <div className='box-border max-w-full flex-auto flex flex-col gap-2 drop-shadow-2xl pb-5'>
      {content}
    </div>
  )
}

//w-[58%]