import { useDispatch } from 'react-redux';
import { CodeProps, TypingEvent } from '../data';
import { createContext, useEffect, useState } from 'react';
import { setLoggedInUser } from "../features/auth/userSlice";
import { useGetCurrentUserMutation } from "../app/api/usersApiSlice";
import { PostType, ChildrenProp, PostContextType, CodeStoreType, ImageType } from '../posts';
import { connect, Socket } from 'socket.io-client';
import { BASEURL } from '../app/api/apiSlice';

let socket: Socket
export const PostContext = createContext<PostContextType | null>(null)

const initState = { codeId: '', langType: '', code: '', date: '' }
export const PostDataProvider = ({ children }: ChildrenProp) => {
  //socket = new Socket()
  const [search, setSearch] = useState<string>('');
  const [filteredStories, setFilterStories] = useState<PostType[]>([])
  const [typingEvent, setTypingEvent] = useState<TypingEvent>('notTyping');

  const [imagesFiles, setImagesFiles] = useState<ImageType[]>([]);
  const [canPost, setCanPost] = useState<boolean>(false);
  const [navPosts, setNavPosts] = useState<PostType[]>([])

  const userId = localStorage.getItem('revolving_userId') as string
  const [inputValue, setInputValue] = useState<CodeStoreType>(initState)
  const [submitToSend, setSubmitToSend] = useState<CodeProps[]>([])

  const [codeStore, setCodeStore] = useState<CodeStoreType[]>(JSON.parse(localStorage.getItem('revolving-codeStore') as string) as CodeStoreType[] || [])
  const [getLoggedInUser] = useGetCurrentUserMutation()
  const dispatch = useDispatch()

  useEffect(() => {
    let isMounted = true
    if(isMounted && userId){
      socket = connect('http://localhost:4000')
    }
    return () => {
      isMounted = false
    }
  }, [userId])

  useEffect(() => {
    let isMounted = true
    const getLoggedIn = async() => {
      const res = await getLoggedInUser(userId).unwrap()
      const { isAccountActivated, refreshToken, verificationToken, ...rest } = res
      dispatch(setLoggedInUser(rest))
      if(!localStorage.getItem('revolving_login_time')){
        localStorage.setItem('revolving_login_time', rest?.updatedAt)
      }
    }
    if(isMounted && userId) getLoggedIn()

    return () => {
      isMounted = false
    }
  }, [userId, dispatch, getLoggedInUser])

  useEffect(() => {
    let isMounted = true
    const getPostFeed = async() => {
      const filtered = navPosts?.filter(post => {
        return (
          post?.title?.toLowerCase().includes(search?.toLowerCase()) || post?.body?.toLowerCase().includes(search?.toLowerCase())
        )
      }) as PostType[]
      // const optimizedFeed = await contentFeedAlgorithm(filtered, 5) as unknown as PostType[]
      // console.log(optimizedFeed)
      setFilterStories(filtered)
    }
    isMounted ? getPostFeed() : null

    return () => {
      isMounted = false
    }
  }, [search, navPosts])

  const value = {
    filteredStories, search, typingEvent, navPosts, canPost, codeStore, inputValue, imagesFiles, submitToSend, setSubmitToSend, setImagesFiles, setInputValue, setCodeStore, setSearch, setTypingEvent, setCanPost, setNavPosts
  }

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  )
}