import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { checkCount } from "../../utils/navigator";
import { ErrorResponse, PositionType } from "../../types/data";
import { PostType, ThemeContextType } from "../../types/posts";
import { useThemeContext } from "../../hooks/useThemeContext";
import { BsFillHandThumbsUpFill, BsHandThumbsUp } from "react-icons/bs";
import { storyApiSlice, useLikeAndUnlikeStoryMutation } from "../../app/api/storyApiSlice";
import { sharedStoryApiSlice, useLikeAndUnlikeSharedStoryMutation } from "../../app/api/sharedStorySlice";

type LikeStoryProps = {
  story: PostType,
  position?: PositionType
}

export default function LikeStory({ story }: LikeStoryProps) {
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [likeAndUnlikeStory, { isLoading: isLikeLoading, error: likeError, isError: isLikeError }] = useLikeAndUnlikeStoryMutation();
  const [likeAndUnlikeSharedStory, { isLoading: isSharedLikeLoading, error: sharedLikeError, isError: isSharedLikeError }] = useLikeAndUnlikeSharedStoryMutation()
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const dispatch = useDispatch()

  const likeUnlikeStory = async() => {
    try{
      const { _id, sharedId } = story
      sharedId 
          ? await likeAndUnlikeSharedStory({userId: currentUserId, sharedId}).unwrap() 
              : await likeAndUnlikeStory({userId: currentUserId, storyId: _id}).unwrap()
      dispatch(storyApiSlice.util.invalidateTags(['STORY']))
      dispatch(sharedStoryApiSlice.util.invalidateTags(['SHAREDSTORY']))
    }
    catch(err: unknown){
      const errors = isLikeError ? likeError as Partial<ErrorResponse> : sharedLikeError as Partial<ErrorResponse>
      const errorMessage = errors?.data?.meta?.message ? errors?.data?.meta?.message : 'An error occurred';
      (!currentUserId || !errors || errors?.originalStatus == 401) ? setLoginPrompt({opened: 'Open'}) : null;
      (isLikeError || isSharedLikeError) && toast.error(`${errors?.status == 'FETCH_ERROR' ? 'SERVER ERROR' : (errors?.originalStatus == 401 ? 'Please sign in' : errorMessage)}`, {
        duration: 2000, icon: '💀', style: {
          background: '#FF0000'
        }
      })
    }
  }

  return (
    <p 
      onClick={likeUnlikeStory}
      className={`flex items-center gap-1 ${(isLikeLoading || isSharedLikeLoading) && 'animate-bounce'}`}>
      {
        (story?.sharedLikes ? story?.sharedLikes?.includes(currentUserId) : story?.likes?.includes(currentUserId)) 
          ?
          <BsFillHandThumbsUpFill 
          title='like'
          className={`text-lg shadow-2xl shadow-slate-200 hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${theme == 'light' ? 'text-green-500' : ''}`} />
          :
          <BsHandThumbsUp
            title='like' 
            className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer`} />
      }
        <span className={`font-mono text-base ${theme == 'dark' && 'text-white'}`}>
          {story?.sharedLikes ? checkCount(story?.sharedLikes) : checkCount(story?.likes)}
        </span>
    </p>
  )
}