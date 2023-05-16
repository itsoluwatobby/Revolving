import axios, { AxiosInstance } from 'axios';
import { PostType } from '../posts';

export const posts_endPoint = '/story'
export const auth_endPoint = '/login'

const BASEURL = 'http://localhost:4000/revolving'
const AUTHURL = 'http://localhost:4000/revolving/auth'

const postAxios: AxiosInstance = axios.create({
  baseURL: BASEURL,
  headers: { 'Content-Type ': 'application/json'}
})

export const axiosAuth: AxiosInstance = axios.create({
  baseURL: AUTHURL,
  headers: { 'Content-Type ': 'application/json'},
  withCredentials: true
})

export const axiosPrivate: AxiosInstance = axios.create({
  baseURL: BASEURL,
  headers: { 'Content-Type ': 'application/json'},
  withCredentials: true
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


