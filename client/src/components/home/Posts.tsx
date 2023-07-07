import { PostContextType, PostType, ThemeContextType } from '../../posts'
import { SkeletonBlog } from '../skeletons/SkeletonBlog';
import { Post } from './Post';
import { RiSignalWifiErrorLine } from 'react-icons/ri'
import { BiErrorAlt } from 'react-icons/bi'
import { usePostContext } from '../../hooks/usePostContext';
import { useState, useEffect } from 'react';
import { ErrorResponse } from '../../data';
import Comments from '../comments/Comments';
import { useThemeContext } from '../../hooks/useThemeContext';
import { useGetStoriesByCategoryQuery } from '../../app/api/storyApiSlice';
import { useSelector } from 'react-redux';
import { getTabCategory } from '../../features/story/navigationSlice';
import useRevolvingPostFeed from '../../hooks/useRevolvingPostFeed';
import { TimeoutId } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';

const REFRESH_RATE = 10_000 as const

export const Posts = () => {
  const getNavigation = useSelector(getTabCategory)
  const {data, isLoading, isError, error, refetch} = useGetStoriesByCategoryQuery(getNavigation)
  const { filteredStories, setNavPosts } = usePostContext() as PostContextType
  const { openComment, setOpenChat, loginPrompt, setLoginPrompt } = useThemeContext() as ThemeContextType
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>()
  //const filteredFeeds = useRevolvingPostFeed(filteredStories, filteredStories) as PostType[]

  useEffect(() => {
    let isMounted = true
    isMounted && setErrorMsg(error as ErrorResponse)
    return () => {
      isMounted = false
    }
  }, [error])

  useEffect(() => {
    let timerId: TimeoutId
    if(!data?.length && isError && errorMsg?.status != 404){
      timerId = setInterval(async() => {
        await refetch()
      }, REFRESH_RATE)
    }
    return () => clearInterval(timerId)
  }, [data, isError, errorMsg?.status, refetch])
  
  useEffect(() => {
    // mutate()
    setNavPosts(data as PostType[])
  }, [getNavigation, data, setNavPosts])

  let content;

  isLoading ? content = (
    [...Array(10).keys()].map(index => (
        <SkeletonBlog key={index} />
        )
      )
  ) 
  : isError ? content = (
      <p className='flex flex-col gap-5 items-center text-3xl text-center mt-5 text-red-400'>
        <span>
          {errorMsg?.status == 404 ? 
              'No Story Avaialable' 
                  : 'Network Error, Please check your connection'
          }
        </span>
        {errorMsg?.status == 404 ? 
          <BiErrorAlt className='text-6xl text-gray-400' />
          :
          <RiSignalWifiErrorLine className='text-6xl text-gray-600' />
        }
      </p> 
    ) : (
      filteredStories?.length ? content = (
        filteredStories?.map(post => (
            <Post key={post?.sharedId || post?._id} 
              story={post as PostType} 
            />
          )
        )
      ) : null
    )

  return (
    <div 
      onClick={() => {
          setOpenChat('Hide')
          setLoginPrompt('Hide')
        }
      }
      className={`relative ${loginPrompt == 'Open' ? 'opacity-40 transition-all' : null} box-border max-w-full flex-auto flex flex-col gap-2 drop-shadow-2xl pb-5`}>
      {openComment?.option == 'Open' ? <Comments /> : content }
    </div>
  )
}

//w-[58%]