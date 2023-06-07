import axios, { AxiosInstance } from 'axios';
import { PostType } from '../posts';

export const posts_endPoint = '/story'
export const auth_endPoint = '/login'
export const user_endPoint = '/users'

const BASEURL = 'http://localhost:4000/revolving'
const AUTHURL = 'http://localhost:4000/revolving/auth'
const USERSURL = 'http://localhost:4000/revolving'

export const postAxios: AxiosInstance = axios.create({
  baseURL: BASEURL,
  headers: { 'Content-Type ': 'application/json'}
})

export const axiosAuth: AxiosInstance = axios.create({
  baseURL: AUTHURL,
  headers: { 'Content-Type ': 'application/json'},
  withCredentials: true
})

export const userAxios: AxiosInstance = axios.create({
  baseURL: USERSURL,
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
  return posts?.data?.data
}

export const deletePost = async(id: string): Promise<PostType[]> => {
  const res = await postAxios.delete(`user${posts_endPoint}/${id}`)
  return res?.data
}


