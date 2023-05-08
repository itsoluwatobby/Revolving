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
  const res = await postAxios.post(`${posts_endPoint}`, newPost)
  return res?.data
}

export const updatePost = async(updatedPost: PostType): Promise<PostType[]> => {
  const res = await postAxios.put(`${posts_endPoint}/${updatedPost?.id}`, {...updatePost})
  return res?.data
}

export const deletePost = async(id: string): Promise<PostType[]> => {
  const res = await postAxios.delete(`${posts_endPoint}/${id}`)
  return res?.data
}


