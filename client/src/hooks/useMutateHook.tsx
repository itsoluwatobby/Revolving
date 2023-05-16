import useAxiosPrivate from './useAxiosPrivate'
import { PostType } from '../posts'
import { posts_endPoint } from '../api/axiosPost'

export default function useMutatePost() {
  const axiosPrivate = useAxiosPrivate()

  const createPost = async(newPost: PostType): Promise<PostType[]> => {
    const res = await axiosPrivate.post(`${posts_endPoint}`, newPost)
    return res?.data
  }
  
  const updatePost = async(updatedPost: PostType): Promise<PostType[]> => {
    const res = await axiosPrivate.put(`${posts_endPoint}/${updatedPost?.id}`, {...updatePost})
    return res?.data
  }
  
  return [createPost, updatePost]
}