import { BsFillHandThumbsUpFill, BsHandThumbsUp } from "react-icons/bs"
import { PostType, ThemeContextType } from "../../posts"
import { checkCount } from "../../utils/navigator"
import { storyApiSlice, useLikeAndUnlikeStoryMutation } from "../../app/api/storyApiSlice"
import { useDispatch } from "react-redux"
import { ErrorResponse, PositionType } from "../../data"
import { useThemeContext } from "../../hooks/useThemeContext"
import { toast } from "react-hot-toast"

type LikeStoryProps = {
  story: PostType,
  position: PositionType
}

export default function LikeStory({ story, position }: LikeStoryProps) {
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [likeAndUnlikeStory, { isLoading: isLikeLoading, error: likeError, isError: isLikeError }] = useLikeAndUnlikeStoryMutation();
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const dispatch = useDispatch()

  const likeUnlikeStory = async() => {
    try{
      const { _id } = story
      await likeAndUnlikeStory({userId: currentUserId, storyId: _id}).unwrap()
      dispatch(storyApiSlice.util.invalidateTags(['STORY']))
    }
    catch(err: unknown){
      const errors = likeError as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      isLikeError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  return (
    <p 
      onClick={likeUnlikeStory}
      className={`flex items-center gap-1 ${isLikeLoading && 'animate-bounce'}`}>
      {
        (story?.sharedLikes ? story?.sharedLikes?.includes(currentUserId) : story?.likes?.includes(currentUserId)) 
          ?
          <BsFillHandThumbsUpFill 
          title='like'
          className={`text-lg shadow-2xl shadow-slate-200 hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${theme == 'light' ? 'text-green-500' : ''}`} />
          :
          <BsHandThumbsUp
            title='like' 
            className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${(story?.likes.includes(currentUserId) || story?.sharedLikes?.includes(currentUserId)) && 'text-red-500'} `} />
      }
        <span className={`font-mono text-base ${theme == 'dark' && 'text-white'}`}>
          {story?.sharedLikes ? checkCount(story?.sharedLikes) : checkCount(story?.likes)}
        </span>
    </p>
  )
}