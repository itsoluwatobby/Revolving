import { Post } from '../home/Post';
import { BiErrorAlt } from 'react-icons/bi'
import { useState, useEffect } from 'react';
import { ErrorResponse } from '../../types/data';
import { SerializedError } from '@reduxjs/toolkit';
import { RiSignalWifiErrorLine } from 'react-icons/ri';
import { SkeletonBlog } from '../skeletons/SkeletonBlog';
import { ImageTypeProp, PostType, Theme } from '../../types/posts';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';

type Props = {
  theme: Theme
  isStoryError: boolean,
  userStories: PostType[],
  isStoryLoading: boolean,
  storyError: FetchBaseQueryError | SerializedError | undefined,
  setRevealEditModal: React.Dispatch<React.SetStateAction<ImageTypeProp>>
}

export default function ProfileBase({ setRevealEditModal, userStories, theme, isStoryError, storyError, isStoryLoading }: Props) {
  const [errorMsg, setErrorMsg] = useState<ErrorResponse | null>()
 
  useEffect(() => {
    let isMounted = true
    isMounted && setErrorMsg(storyError as ErrorResponse)
    return () => {
      isMounted = false
    }
  }, [storyError])

  let userContent;

  isStoryLoading ? userContent = (
    [...Array(3).keys()].map(index => (
        <SkeletonBlog key={index} />
        )
      )
  ) 
  : isStoryError ? userContent = (
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
      userStories?.length ? userContent = (
        userStories?.map(story => (
          <Post
            key={story?.sharedId || story?._id}
            story={story as PostType}
            page="PROFILE"
          />
        ))
      ) : null
    )

  return (
    <section 
      onClick={() => setRevealEditModal('NIL')}
      className={`flex-none pb-4 flex flex-col w-full`}>
      <hr className={`w-full border ${theme == 'light' ? 'border-gray-200' : 'border-gray-600'}`}/> 
      <div className={`sticky top-0 md:-top-8 z-30 py-2 px-1 italic ${theme === 'light' ? 'text-gray-600 bg-white' : 'text-gray-400 bg-slate-800'} capitalize tracking-wide w-full`}>Your stories and stories you engaged in</div>
  
      <div className='flex flex-col gap-3'>
      
        {userContent}

      </div>
  
    </section>
  )
}