import { PostContextType, PostType, ThemeContextType } from '../posts'
import { SkeletonBlog } from './skeletons/SkeletonBlog';
import { Post } from './Post';
import { RiSignalWifiErrorLine } from 'react-icons/ri'
import { usePostContext } from '../hooks/usePostContext';
import { useEffect } from 'react';
import { Categories } from '../data';
import Comments from './comments/Comments';
import { useThemeContext } from '../hooks/useThemeContext';
import { useGetStoriesByCategoryQuery } from '../app/api/storyApiSlice';

type PostsProps = {
  navigationTab: Categories
}

export const Posts = ({ navigationTab }: PostsProps) => {
  const {data, isLoading, isError, error} = useGetStoriesByCategoryQuery(navigationTab)
  const { filteredStories, setNavPosts } = usePostContext() as PostContextType
  const { openComment, setOpenChat, loginPrompt, setLoginPrompt } = useThemeContext() as ThemeContextType
  
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
    <span>{error?.status}</span>
    <RiSignalWifiErrorLine className='text-6xl text-gray-600' />
    </p> 
  :(
    filteredStories?.length ? content = (
      filteredStories?.map(post => (
            <Post key={post?.sharedId || post?._id} 
              post={post as PostType} 
              //navigationTab={navigationTab}
            />
          )
        )
      ) 
      : content = (<p className='m-auto text-3xl capitalize font-mono text-gray-400'>No stories available</p>)
  )
  return (
    <div 
      onClick={() => {
        setOpenChat('Hide')
        setLoginPrompt('Hide')
      }
      }
      className={`relative ${loginPrompt == 'Open' ? 'opacity-40 transition-all' : null} box-border max-w-full flex-auto flex flex-col gap-2 drop-shadow-2xl pb-5`}>
      {openComment ? <Comments /> : content }
    </div>
  )
}

//w-[58%]