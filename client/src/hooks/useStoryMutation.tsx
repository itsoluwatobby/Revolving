import useAxiosPrivate from './useAxiosPrivate'
import { PostType } from '../posts'
import { posts_endPoint } from '../api/axiosPost'
import useAuthenticationContext from './useAuthenticationContext'
import { AuthenticationContextType } from '../data'

export default function useStoryMutation() {
  const axiosPrivate = useAxiosPrivate()
  const { auth } = useAuthenticationContext() as AuthenticationContextType

  const createPost = async(newPost: PostType): Promise<PostType[]> => {
    const res = await axiosPrivate.post(`${posts_endPoint}/${auth?._id}`, newPost)
    return res?.data?.data
  }
  
  const updatePost = async(updatedPost: PostType): Promise<PostType[]> => {
    const res = await axiosPrivate.put(`${posts_endPoint}/${auth?._id}/${updatedPost?._id}`, {...updatedPost})
    return res?.data?.data
  }

  const likeUnlikePost = async(storyId: string): Promise<PostType[]> => {
    const res = await axiosPrivate.patch(`${posts_endPoint}/${auth?._id}/${storyId}`)
    return res?.data?.message
  }

  const getUserStorys = async(): Promise<PostType[]> => {
    const res = await axiosPrivate.patch(`${posts_endPoint}/user/${auth?._id}`)
    return res?.data?.data
  }
  
  return {createPost, updatePost, likeUnlikePost, getUserStorys}
}
