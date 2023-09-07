import { createContext, useEffect, useState } from 'react';
import { PostType, ChildrenProp, PostContextType, CodeStoreType, ImageType } from '../posts';
import { useGetCurrentUserMutation } from "../app/api/usersApiSlice"
import { setLoggedInUser } from "../features/auth/userSlice";
import { useDispatch } from 'react-redux';
import { TypingEvent } from '../data';

export const PostContext = createContext<PostContextType | null>(null)

const initState = { codeId: '', langType: '', code: '', date: '' }
export const PostDataProvider = ({ children }: ChildrenProp) => {
  const [search, setSearch] = useState<string>('');
  const [filteredStories, setFilterStories] = useState<PostType[]>([])
  const [typingEvent, setTypingEvent] = useState<TypingEvent>('notTyping');

  const [imagesFiles, setImagesFiles] = useState<ImageType[]>([]);
  const [canPost, setCanPost] = useState<boolean>(false);
  const [navPosts, setNavPosts] = useState<PostType[]>([])
  
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [inputValue, setInputValue] = useState<CodeStoreType>(initState)
  const [codeStore, setCodeStore] = useState<CodeStoreType[]>(JSON.parse(localStorage.getItem('revolving-codeStore') as string) as CodeStoreType[] || [])
  const [getLoggedInUser] = useGetCurrentUserMutation()
  const dispatch = useDispatch()

  useEffect(() => {
    let isMounted = true
    const getLoggedIn = async() => {
      const res = await getLoggedInUser(currentUserId).unwrap()
      const { authentication, isAccountActivated, refreshToken, verificationToken, ...rest } = res
      dispatch(setLoggedInUser(rest))
    }
    if(isMounted && currentUserId) getLoggedIn()

    return () => {
      isMounted = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    filteredStories, search, typingEvent, navPosts, canPost, codeStore, inputValue, imagesFiles, setImagesFiles, setInputValue, setCodeStore, setSearch, setTypingEvent, setCanPost, setNavPosts
  }

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  )
}