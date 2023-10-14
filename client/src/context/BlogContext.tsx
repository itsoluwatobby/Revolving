import { useDispatch } from 'react-redux';
import { useThemeContext } from '../hooks/useThemeContext';
import { createContext, useEffect, useState } from 'react';
import { setLoggedInUser } from "../features/auth/userSlice";
import { useGetCurrentUserMutation } from "../app/api/usersApiSlice";
import { CodeProps, ErrorResponse, TypingEvent, TypingObjType, UserProps } from '../data';
import { PostType, ChildrenProp, PostContextType, CodeStoreType, ImageType, ThemeContextType } from '../posts';


export const PostContext = createContext<PostContextType | null>(null)

const initState = { codeId: '', langType: '', code: '', date: '' }
const initTypingObj = { firstName: '', userId: '', conversationId: '' }
export const PostDataProvider = ({ children }: ChildrenProp) => {
  const [search, setSearch] = useState<string>('');
  const { openChat } = useThemeContext() as ThemeContextType
  const [filteredStories, setFilterStories] = useState<PostType[]>([])
  const [typingEvent, setTypingEvent] = useState<TypingEvent>('notTyping');

  const [canPost, setCanPost] = useState<boolean>(false);
  const [navPosts, setNavPosts] = useState<PostType[]>([])
  const [imagesFiles, setImagesFiles] = useState<ImageType[]>([]);

  const userId = localStorage.getItem('revolving_userId') as string
  const [inputValue, setInputValue] = useState<CodeStoreType>(initState)
  const [submitToSend, setSubmitToSend] = useState<CodeProps[]>([])
  
  const [typingObj, setTypingObj] = useState<TypingObjType>(initTypingObj)
  const [currentUser, setCurrentUser] = useState<UserProps>()
  const [codeStore, setCodeStore] = useState<CodeStoreType[]>(JSON.parse(localStorage.getItem('revolving-codeStore') as string) as CodeStoreType[] || [])
  
  const [getLoggedInUser] = useGetCurrentUserMutation()
  const dispatch = useDispatch()

  useEffect(() => {
    let isMounted = true
    const getCurrentUser = async() => {
      getLoggedInUser(userId).unwrap()
      .then((user: UserProps) => setCurrentUser(user))
      .catch((error: unknown) => {
        const errors = error as ErrorResponse
        void(errors)
      })
    }
    if(isMounted && userId && !currentUser?._id && openChat === 'Open') getCurrentUser()
    return () => {
      isMounted = false
    }
  }, [userId, currentUser, getLoggedInUser, openChat])

  useEffect(() => {
    let isMounted = true
    const getLoggedIn = async() => {
      const res = await getLoggedInUser(userId).unwrap()
      const { isAccountActivated, refreshToken, verificationToken, ...rest } = res
      dispatch(setLoggedInUser(rest))
      void(isAccountActivated) 
      void(refreshToken) 
      void(verificationToken)
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
    filteredStories, search, typingEvent, navPosts, currentUser, canPost, codeStore, inputValue, imagesFiles, submitToSend, typingObj, setTypingObj, setSubmitToSend, setImagesFiles, setInputValue, setCodeStore, setSearch, setTypingEvent, setCanPost, setNavPosts
  }

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  )
}