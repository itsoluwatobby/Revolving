import axios from 'axios';
import { PostType } from '../posts';

export const posts_endPoint = '/posts'

const postAxios = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type ': 'application/json'}
})

export const getPosts = async(): Promise<PostType[]> => {
  const posts = await postAxios.get(posts_endPoint)
  return posts?.data
}

export const createPost = async(newPost: PostType): Promise<PostType[]> => {
  const {postId, ...rest} = newPost
  const res = await postAxios.post(`${posts_endPoint}`, rest)
  return res?.data
}

export const updatePost = async(updatedPost: PostType): Promise<PostType[]> => {
  const res = await postAxios.put(`${posts_endPoint}/${updatedPost?.postId}`, updatePost)
  return res?.data
}

export const deletePost = async(postId: string): Promise<PostType[]> => {
  const res = await postAxios.put(`${posts_endPoint}/${postId}`)
  return res?.data
}


