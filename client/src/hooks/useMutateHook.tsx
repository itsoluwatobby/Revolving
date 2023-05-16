import useAxiosPrivate from './useAxiosPrivate'
import { PostType } from '../posts'
import { posts_endPoint } from '../api/axiosPost'
import useAuthenticationContext from './useAuthenticationContext'

export default function useMutatePost() {
  const axiosPrivate = useAxiosPrivate()
  const { auth } = useAuthenticationContext() as AuthenticationContextType

  const createPost = async(newPost: PostType): Promise<PostType[]> => {
    const res = await axiosPrivate.post(`${posts_endPoint}`, newPost)
    return res?.data
  }
  
  const updatePost = async(updatedPost: PostType): Promise<PostType[]> => {
    const res = await axiosPrivate.put(`${posts_endPoint}/${auth?._id}/${updatedPost?._id}`, {...updatedPost})
    return res?.data
  }
  
  return [createPost, updatePost]
}