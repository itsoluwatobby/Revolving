import { BsFillHandThumbsUpFill, BsHandThumbsUp } from "react-icons/bs"
import { MdOutlineInsertComment } from "react-icons/md"
import { useThemeContext } from "../../hooks/useThemeContext"
import { MakeToButtom, ThemeContextType } from "../../posts"
import { Link } from "react-router-dom"
import { RxShare2 } from "react-icons/rx"
import { useLikeAndUnlikeStoryMutation } from "../../app/api/storyApiSlice"
import { toast } from "react-hot-toast";
import { ErrorResponse } from "../../data"

type PostButtomProps = {
  story: MakeToButtom,
  averageReadingTime: string,
}

export default function PostBase({ story, averageReadingTime }: PostButtomProps) {
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const { theme,  setOpenComment, setLoginPrompt } = useThemeContext() as ThemeContextType
  const [likeAndUnlikeStory, { isLoading: isLikeLoading, error: likeError, isError: isLikeError }] = useLikeAndUnlikeStoryMutation()
  // const { data: commentData, isLoading, 
  //   isError: isCommentError,
  // } = useGetCommentsQuery(story?._id)
  // const [comments, setComments] = useState<CommentProps[]>([])

  // useEffect(() => {
  //   let isMounted = true
  //   isMounted && setComments(commentData as CommentProps[])
  //   return () => {
  //     isMounted = false
  //   }
  // }, [commentData])


  const likeUnlikeStory = async() => {
    try{
      const { _id } = story
      await likeAndUnlikeStory({userId: currentUserId, storyId: _id}).unwrap()
    }
    catch(err: unknown){
      const errors = likeError as Partial<ErrorResponse>
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isLikeError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  return (
    <div className='mt-2 opacity-90 flex items-center gap-5 text-green-600 text-sm font-sans'>
        <p>{story?.body ? averageReadingTime + ' read' : ''}</p>
        {
          (story?.sharedLikes ? story?.sharedLikes?.includes(currentUserId) : story?.likes?.includes(currentUserId)) 
            ?
              <p 
                onClick={likeUnlikeStory}
                className={`flex items-center gap-1 ${isLikeLoading && 'animate-bounce'}`}>
                <BsFillHandThumbsUpFill title='like' className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${theme == 'light' ? 'text-green-800' : ''}`} />
                <span className={`font-mono text-base ${theme == 'dark' && 'text-white'}`}>
                  {story?.likes?.length}
                </span>
              </p>
            :
              <p 
                onClick={likeUnlikeStory}
                className={`flex items-center gap-1 ${theme == 'light' ? 'text-black' : 'text-white'} ${isLikeLoading && 'animate-bounce'} `}>
                  <BsHandThumbsUp title='like' className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${story?.likes.includes(currentUserId) && 'text-red-500'}`} />
                  <span className={``}>
                    {story?.likes?.length}
                  </span>
              </p>
        }
        {/* {auth?._id && (     */}
          <p className={`flex items-center gap-1.5 ${theme == 'light' ? 'text-black' : 'text-white'}`}>
            <MdOutlineInsertComment 
              title='comments'
              onClick={() => setOpenComment({option: 'Open', storyId: story._id})}
              className={`font-sans text-lg cursor-pointer ${theme == 'light' ? 'text-black' : 'text-gray-300'} hover:text-blue-800`}/>
            <span className="">
              {story?.commentIds?.length}
            </span>
          </p>
          {/* )
        } */}
        {story?.body && (
            story?.body.split(' ').length >= 100 &&
            <Link to={`/story/${story?._id}`}>
              <small className={`font-sans cursor-grab ${theme == 'light' ? 'text-gray-900' : 'text-gray-300'} hover:text-blue-800`}>Read more</small>
            </Link>
          )
        }
        {/* {auth?._id && (     */}
          <p className='flex items-center gap-1.5'>
            <RxShare2 
              title='share story' 
              className={`font-sans text-lg cursor-pointer ${theme == 'light' ? 'text-black' : 'text-gray-300'} hover:text-blue-800`}
            />
            <span role='count' title='share count' className={`${theme == 'light' ? 'text-black' : 'text-white'}`}>
              {story?.isShared?.length}
            </span>
          </p>
          
          {/* )
        } */}
      </div>
  )
}