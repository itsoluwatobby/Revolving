import { createContext, useEffect, useState } from 'react';
import { PostType, ChildrenProp, PostContextType } from '../posts';

export const PostContext = createContext<PostContextType | null>(null)

export const PostDataProvider = ({ children }: ChildrenProp) => {
  const [search, setSearch] = useState<string>('');
  const [filteredStories, setFilterStories] = useState<PostType[]>([])
  const [typingEvent, setTypingEvent] = useState<boolean>(false);
  const [canPost, setCanPost] = useState<boolean>(false);
  const [navPosts, setNavPosts] = useState<PostType[]>([])
  const [url, setUrl] = useState<string>()

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

  const uploadToCloudinary = async (image: File) => {
    const data = new FormData()
    data.append('file', image)
    data.append('upload_preset', 'dwb3ksib')

    const res = await fetch(`https://api.cloudinary.com/v1_1/dr8necpxh/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: data
    })
    const returnedData = await res.json() as { data: { url: string } }
    setUrl(returnedData?.data.url)
  }

  const value = {
    filteredStories, url, uploadToCloudinary, search, setSearch, typingEvent, setTypingEvent, canPost, setCanPost, navPosts, setNavPosts
  }

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  )
}