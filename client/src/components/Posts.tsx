//import { useState, useEffect } from 'react';
import { PostContextType, PostType, ThemeContextType } from '../posts'
import { SkeletonBlog } from './skeletons/SkeletonBlog';
import { Post } from './Post';
import { RiSignalWifiErrorLine } from 'react-icons/ri'
import { usePostContext } from '../hooks/usePostContext';
import { useEffect } from 'react';
import { Categories } from '../data';
// import useSWRInfinite, {SWRInfiniteKeyLoader} from 'swr/infinite';
// import useSWRImmutable from 'swr/immutable';
// import { posts_endPoint as cacheKey, postAxios } from '../api/axiosPost';
import Comments from './comments/Comments';
import { useThemeContext } from '../hooks/useThemeContext';
import { useGetStoriesByCategoryQuery } from '../app/api/storyApiSlice';

type PostsProps = {
  navigationTab: Categories
}

export const Posts = ({ navigationTab }: PostsProps) => {
  const {data, isLoading, isError, error} = useGetStoriesByCategoryQuery(navigationTab)
  // const getKey = (navigationTab: Categories) => {
  //   return `${cacheKey}/category/${navigationTab}`
  // }
  // const { data, isLoading, error, mutate} = useSWRImmutable<PostType[]>(getKey, async(): Promise<PostType[]> => {
  //   const res = await postAxios.get(`${cacheKey}/category?category=${navigationTab}`)
  //   return res?.data.data
  // }, {
  //   onSuccess: data => data?.sort((a, b) => b?.storyDate.localeCompare(a?.storyDate)),
  // })
  const { filteredStories, setNavPosts } = usePostContext() as PostContextType
  const { openComment, setOpenChat } = useThemeContext() as ThemeContextType
  
  useEffect(() => {
    // mutate()
    setNavPosts(data as PostType[])
  }, [navigationTab, data, setNavPosts])

  let content;

  isLoading ? content = (
    [...Array(10).keys()].map(index => (
        <SkeletonBlog key={index} />
        )
      )
  ) 
  : isError ? content = <p className='flex flex-col gap-5 items-center text-3xl text-center text-red-400'>
    {error.status}
    <RiSignalWifiErrorLine className='text-6xl text-gray-600' />
    </p> 
  :(
    filteredStories?.length ? content = (
      filteredStories?.map(post => (
            <Post key={post?.sharedId || post?._id} 
              post={post as PostType} 
              navigationTab={navigationTab}
            />
          )
        )
      ) 
      : content = (<p className='m-auto text-3xl capitalize font-mono text-gray-400'>No stories available</p>)
  )
  return (
    <div 
      onClick={() => setOpenChat('Hide')}
      className='relative box-border max-w-full flex-auto flex flex-col gap-2 drop-shadow-2xl pb-5'>
      {openComment ? <Comments /> : content }
    </div>
  )
}

//w-[58%]