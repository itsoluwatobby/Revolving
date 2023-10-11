import { toast } from 'react-hot-toast';
import { Theme, ThemeContextType } from '../../posts';
import { useState, useCallback, useEffect } from 'react';
import { useThemeContext } from '../../hooks/useThemeContext';
import { ErrorResponse, HoverType, PositionType } from '../../data';
import { useFollowUnfollowUserMutation, useGetUserByIdQuery } from '../../app/api/usersApiSlice';

type FollowUnFollowProps = {
  userId: string,
  position: PositionType
}

const initFollowOption = { isFollowing: false, isFollowed: false }

export default function FollowUnFollow({ userId, position }: FollowUnFollowProps) {
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const {data: user} = useGetUserByIdQuery(currentUserId)
  const [isFollowOption, setIsFollowOption] = useState<typeof initFollowOption>(initFollowOption)
  
  const [followUnfollowUser, { isLoading: isMutating, 
    error: followError,  isError: isFollowError, 
    isSuccess: isFollowSuccess }] = useFollowUnfollowUserMutation()

  const [hoverThis, setHoverThis] = useState<HoverType>('following');
  const buttonClass = useCallback((isMutating: boolean, theme?: Theme, position?: PositionType) => {
    return `
    ${position?.includes('profile') ? 'rounded-sm p-2 px-0 text-sm' : 'rounded-md p-1 px-1.5'} ${position?.includes('others') ? 'text-sm' : 'text-xs'} shadow-lg bg-slate-500 capitalize hover:opacity-90 transition-shadow transition-all active:opacity-100 ${isMutating && 'animate-pulse'} ${theme == 'light' ? 'text-white' : ''}
    `
  }, [])

  const { isFollowing, isFollowed } = isFollowOption
  
  useEffect(() => {
    let isMounted = true
    if(isMounted && userId !== user?._id){
      const following = user?.followings?.find(sub => sub?.followRecipientId === userId) ? true : false
      const followed = user?.followers?.find(sub => sub?.followerId === userId) ? true : false
      setIsFollowOption(prev => ({...prev, isFollowing: following, isFollowed: followed}))
    }
    return () => {
      isMounted = false
    }
  }, [user?.followings, user?.followers, user?._id, currentUserId, userId])

  const followOrUnfollow = async() => {
    try{
      const requestIds = { followerId: currentUserId, followedId: userId }
    
      await followUnfollowUser(requestIds).unwrap()
      // await refetch()
      isFollowSuccess && toast.success('Success!!', {
                      duration: 2000, icon: '👋', style: {
                        background: '#1E90FF'
                      }
                    })
    }
    catch(err: unknown){
      const errors = followError as ErrorResponse
      (!currentUserId || errors?.originalStatus == 401) ? setLoginPrompt({opened: 'Open'}) : null
      isFollowError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  return (
    <>
      {
        (currentUserId && currentUserId !== userId) ? (
          !isFollowing ? (
            <button 
              onClick={followOrUnfollow}
              className={buttonClass(isMutating, theme, position)}>
              {(isFollowed || position?.includes('followPage')) ? 'follow back' : 'follow'}
            </button>
            ):(
            <button 
              onClick={followOrUnfollow}
              onMouseEnter={() => setHoverThis('unfollow')}
              onMouseLeave={() => setHoverThis('following')}
              className={buttonClass(isMutating, theme, position)}>
                {hoverThis == 'unfollow' ? 'unfollow' : 'following'}
            </button>
          )
        ) : null
      }
    </>
  )
}