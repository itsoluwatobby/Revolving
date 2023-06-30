import { BsFillHandThumbsUpFill, BsHandThumbsUp } from "react-icons/bs"
import { MdOutlineInsertComment } from "react-icons/md"
import { useThemeContext } from "../../../hooks/useThemeContext"
import { MakeToButtom, ThemeContextType } from "../../../posts"
import { Link } from "react-router-dom"
import { AiOutlineRetweet } from "react-icons/ai"
import { useLikeAndUnlikeStoryMutation } from "../../../app/api/storyApiSlice"
import { toast } from "react-hot-toast";
import { ErrorResponse } from "../../../data"
import { checkCount } from "../../../utils/navigator"

type PostButtomProps = {
  story: MakeToButtom,
  averageReadingTime: string,
}

export default function PostBase({ story, averageReadingTime }: PostButtomProps) {
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const { theme,  setOpenComment, setLoginPrompt } = useThemeContext() as ThemeContextType
  const [likeAndUnlikeStory, { isLoading: isLikeLoading, error: likeError, isError: isLikeError, isUninitialized }] = useLikeAndUnlikeStoryMutation()
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

console.log({isUninitialized})
  const likeUnlikeStory = async() => {
    try{
      const { _id } = story
      await likeAndUnlikeStory({userId: currentUserId, storyId: _id}).unwrap()
    }
    catch(err: unknown){
      const errors = likeError as Partial<ErrorResponse>
      (!errors || errors?.originalStatus == 401) && setLoginPrompt('Open')
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
        <p 
          onClick={likeUnlikeStory}
          className={`flex items-center gap-1 ${isLikeLoading && 'animate-bounce'}`}>
          {
            (story?.sharedLikes ? story?.sharedLikes?.includes(currentUserId) : story?.likes?.includes(currentUserId)) 
              ?
              <BsFillHandThumbsUpFill 
              title='like'
              className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${theme == 'light' ? 'text-green-800' : ''}`} />
              :
              <BsHandThumbsUp 
                title='like' 
                className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${(story?.likes.includes(currentUserId) || story?.sharedLikes?.includes(currentUserId)) && 'text-red-500'} ${theme == 'light' ? 'text-black' : 'text-white'}`} />
          }
            <span className={`font-mono text-base ${theme == 'dark' ? 'text-white' : 'text-black'}`}>
              {checkCount(story?.likes)}
            </span>
        </p>
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
            <AiOutlineRetweet 
              title='Repost' 
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