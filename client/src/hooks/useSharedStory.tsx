import useAxiosPrivate from './useAxiosPrivate'
import { PostType } from '../posts'
import { posts_endPoint } from '../api/axiosPost'
import useAuthenticationContext from './useAuthenticationContext'
import { AuthenticationContextType, SharedProps } from '../data'

export default function useShareStory() {
  const axiosPrivate = useAxiosPrivate()
  const { auth } = useAuthenticationContext() as AuthenticationContextType

  const shareStory = async(storyId: string): Promise<SharedProps[]> => {
    const res = await axiosPrivate.post(`${posts_endPoint}/share/${auth?._id}/${storyId}`)
    return res?.data?.data
  }

  const likeUnlikeShared = async(storyId: string): Promise<PostType[]> => {
    const res = await axiosPrivate.patch(`${posts_endPoint}/share/${auth?._id}/${storyId}`)
    return res?.data?.message
  }

  const getUserSharedStorysByUser = async(): Promise<SharedProps[]> => {
    const res = await axiosPrivate.patch(`${posts_endPoint}/share/user/${auth?._id}`)
    return res?.data?.data
  }
  
  const getAllSharedStories = async(): Promise<SharedProps[]> => {
    const res = await axiosPrivate.patch(`${posts_endPoint}/share_getAll`)
    return res?.data?.data
  }
  
  const getSingleSharedStories = async(sharedId: string): Promise<SharedProps[]> => {
    const res = await axiosPrivate.patch(`${posts_endPoint}/share/${sharedId}`)
    return res?.data?.data
  }
  
  const unShareStorysByUser = async(sharedId: string): Promise<SharedProps[]> => {
    const res = await axiosPrivate.patch(`${posts_endPoint}/share/user/${auth?._id}/${sharedId}`)
    return res?.data?.data
  }
  
  return {
    shareStory, likeUnlikeShared, getUserSharedStorysByUser, 
    getAllSharedStories, getSingleSharedStories, unShareStorysByUser
  }
}
