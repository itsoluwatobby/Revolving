import useAxiosPrivate from './useAxiosPrivate'
import { PostType } from '../posts'
import { posts_endPoint } from '../api/axiosPost'
import useAuthenticationContext from './useAuthenticationContext'
import { useNavigate } from 'react-router-dom'

export default function useStoryMutation() {
  const axiosPrivate = useAxiosPrivate()
  const { auth } = useAuthenticationContext() as AuthenticationContextType
  const navigate = useNavigate()

  const createPost = async(newPost: PostType): Promise<PostType[]> => {
    const res = await axiosPrivate.post(`${posts_endPoint}/${auth?._id}`, newPost)
    return res?.data?.data
  }
  
  const updatePost = async(updatedPost: PostType): Promise<PostType[]> => {
    const res = await axiosPrivate.put(`${posts_endPoint}/${auth?._id}/${updatedPost?._id}`, {...updatedPost})
    return res?.data?.data
  }
  
  return [createPost, updatePost]
}
