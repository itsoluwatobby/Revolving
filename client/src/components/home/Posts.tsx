import { Post } from './Post';
import { useSelector } from 'react-redux';
import { BiErrorAlt } from 'react-icons/bi'
import { ErrorResponse } from '../../data';
import { useState, useEffect } from 'react';
import { REFRESH_RATE } from '../../utils/navigator';
import { RiSignalWifiErrorLine } from 'react-icons/ri';
import { SkeletonBlog } from '../skeletons/SkeletonBlog';
import { usePostContext } from '../../hooks/usePostContext';
import { useThemeContext } from '../../hooks/useThemeContext';
import useRevolvingPostFeed from '../../hooks/useRevolvingPostFeed';
import { getTabCategory } from '../../features/story/navigationSlice';
import { PostContextType, PostType, ThemeContextType } from '../../posts'
import { useGetStoriesByCategoryQuery } from '../../app/api/storyApiSlice';
import { TimeoutId } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';
import useRevolvingObserver from '../../hooks/useRevolvingObserver';

const initQuery = { page: 1, limit: 10 }
export const Posts = () => {
  const getNavigation = useSelector(getTabCategory)
  const [pageQuery, setPageQuery] = useState<typeof initQuery>(initQuery)
  const {
    data, isLoading, isError, error, refetch
  } = useGetStoriesByCategoryQuery({
    category: getNavigation
  })
    //  page: pageQuery?.page, limit: pageQuery?.limit
  const { filteredStories, setNavPosts } = usePostContext() as PostContextType
  const { setOpenChat, loginPrompt, setLoginPrompt } = useThemeContext() as ThemeContextType
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>()
  //const filteredFeeds = useRevolvingPostFeed(filteredStories, filteredStories) as PostType[]
  const { isIntersecting, observerRef } = useRevolvingObserver({screenPosition: '0px', threshold: 0.5})
  const { isIntersecting: isIntersecting1, observerRef: observerRef1 } = useRevolvingObserver({screenPosition: '0px', threshold: 0})
  const totalPages = 6 as const

console.log({isIntersecting})
console.log({isIntersecting1})

  useEffect(() => {
    let isMounted = true
    if(isMounted && isIntersecting === 'INTERSECTING'){  
      setPageQuery(prev => ({
        ...prev, 
        page: prev?.page < totalPages ? prev?.page + 1 : prev?.page, 
        // limit: prev?.page < totalPages ? prev?.limit + 10 : prev?.limit
      }))
    }
    else if(isMounted && isIntersecting1 === 'INTERSECTING'){
      setPageQuery(prev => ({
        ...prev, 
        page: (prev?.page >= 1 && prev?.page !== 1) ? prev?.page - 1 : prev?.page, 
        // limit: (prev?.page >= 1 && prev?.page !== 1) ?  prev?.limit - 10 : prev?.limit
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
    if(!data?.length && (isError && errorMsg?.status != 404)){
      timerId = setInterval(async() => {
        console.log('loading...')
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
      // ref={observerRef as React.LegacyRef<HTMLDivElement>}
      onClick={() => {
          setOpenChat('Hide')
          setLoginPrompt('Hide')
        }
      }
      className={`scroll_behavior relative ${loginPrompt == 'Open' ? 'opacity-40 transition-all' : null} box-border max-w-full flex-auto flex flex-col gap-4 pb-5 px-3.5 md:px-6`}>
         <p ref={observerRef1 as React.LegacyRef<HTMLParagraphElement>} />

        {content}

        <div  
          ref={observerRef as React.LegacyRef<HTMLDivElement>}
          className='w-full flex flex-col gap-4'  
        >
          {
            isLoading ? content = (
              [...Array(5).keys()].map(index => (
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