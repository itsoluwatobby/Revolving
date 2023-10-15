import { Post } from './Post';
import { useSelector } from 'react-redux';
import { BiErrorAlt } from 'react-icons/bi'
import { ErrorResponse } from '../../data';
import { useState, useEffect } from 'react';
import { Components, REFRESH_RATE } from '../../utils/navigator';
import { RiSignalWifiErrorLine } from 'react-icons/ri';
import { SkeletonBlog } from '../skeletons/SkeletonBlog';
import { usePostContext } from '../../hooks/usePostContext';
import { useThemeContext } from '../../hooks/useThemeContext';
// import useRevolvingPostFeed from '../../hooks/useRevolvingPostFeed';
import { getTabCategory } from '../../features/story/navigationSlice';
import { PostContextType, PostType, ThemeContextType } from '../../posts'
import { useGetStoriesByCategoryQuery } from '../../app/api/storyApiSlice';
import { TimeoutId } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';
import useRevolvingObserver from '../../hooks/useRevolvingObserver';

const initQuery = { page: 1, limit: 10 }
export const Posts = () => {
  const getNavigation = useSelector(getTabCategory) as Components
  const [pageQuery, setPageQuery] = useState<typeof initQuery>(initQuery)
  const {
    data, isLoading, isError, error, refetch
  } = useGetStoriesByCategoryQuery({
    category: getNavigation, ...pageQuery
  })
  const [reloadCount, setReloadCount] = useState<number>(0)
  const { filteredStories, setNavPosts, search } = usePostContext() as PostContextType
  const { setOpenChat, loginPrompt, setLoginPrompt } = useThemeContext() as ThemeContextType
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>()
  // const filteredFeeds = useRevolvingPostFeed(filteredStories) as PostFeedType
  const { isIntersecting, observerRef } = useRevolvingObserver({screenPosition: '0px', threshold: 0.5})
  const { isIntersecting: isIntersecting1, observerRef: observerRef1 } = useRevolvingObserver({screenPosition: '0px', threshold: 0})
  const totalPages = 6 as const

  useEffect(() => {
    let isMounted = true
    if(isMounted && isIntersecting === 'INTERSECTING'){  
      setPageQuery(prev => ({
        ...prev, 
        page: prev?.page < totalPages ? prev?.page + 1 : prev?.page, 
      }))
    }
    else if(isMounted && isIntersecting1 === 'INTERSECTING'){
      setPageQuery(prev => ({
        ...prev, 
        page: (prev?.page >= 1 && prev?.page !== 1) ? prev?.page - 1 : prev?.page, 
      }))
    }

    return () => {
      isMounted = false
    }
  }, [isIntersecting, isIntersecting1])

  console.log(pageQuery)
  console.log(isLoading)

  useEffect(() => {
    let isMounted = true
    isMounted && setErrorMsg(error as ErrorResponse)
    return () => {
      isMounted = false
    }
  }, [error])

  useEffect(() => {
    let timerId: TimeoutId
    if(!data?.length && (isError && errorMsg?.status != 404) && reloadCount <= 3){
      timerId = setInterval(async() => {
        setErrorMsg(null)
        await refetch()
        setReloadCount(prev => prev + 1)
      }, REFRESH_RATE)
    }
    else if(data?.length) {
      setReloadCount(0)
    }
    return () => clearInterval(timerId)
  }, [data, isError, errorMsg?.status, refetch, reloadCount])

  useEffect(() => {
    if(data?.length) return
    const reloadPageOnWindowFocus = () => setReloadCount(0)
    window.addEventListener('focus', reloadPageOnWindowFocus)
    return () => {
      window.removeEventListener('focus', reloadPageOnWindowFocus)
    }
  }, [data])

  useEffect(() => {
    let isMounted = true
    if(isMounted && data?.length) setNavPosts(data as PostType[])
    if(isMounted && !data?.length) setNavPosts([])
    return () => {
      isMounted = false
    }
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
                  : errorMsg?.status === 'FETCH_ERROR' ?
                      'SERVER ERROR'
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
      ) : content = (
        <h3 className='m-auto text-2xl capitalize'>Story with name <span className='uppercase text-gray-600'>{search}</span> not found</h3>
      )
    )

  return (
    <div 
      // ref={observerRef as React.LegacyRef<HTMLDivElement>}
      onClick={() => {
          setOpenChat('Hide')
          setLoginPrompt({opened: 'Hide'})
        }
      }
      className={`scroll_behavior relative ${loginPrompt?.opened == 'Open' ? 'opacity-40 transition-all' : null} box-border max-w-full flex-auto flex flex-col gap-4 pb-5 px-3.5 md:px-6`}>
         <p ref={observerRef1 as React.LegacyRef<HTMLParagraphElement>} />

        {content}

        <div  
          ref={observerRef as React.LegacyRef<HTMLDivElement>}
          className='w-full flex flex-col gap-4'  
        >
          {
            isLoading ? content = (
              [...Array(3).keys()].map(index => (
                  <SkeletonBlog key={index} />
                  )
                )
            ) : null
          }
        </div>
    </div>
  )
}

//w-[58%]