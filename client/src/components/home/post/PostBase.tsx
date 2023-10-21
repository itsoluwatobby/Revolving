import { useState } from 'react';
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { PostLikes } from './PostLikes.';
import Comments from "../../comments/Comments";
import { AiOutlineRetweet } from "react-icons/ai";
import { ErrorResponse } from "../../../types/data";
import { MdOutlineInsertComment } from "react-icons/md";
import { useThemeContext } from "../../../hooks/useThemeContext";
import { BsFillHandThumbsUpFill, BsHandThumbsUp } from "react-icons/bs";
import { useLikeAndUnlikeStoryMutation } from "../../../app/api/storyApiSlice";
import { ErrorStyle, SuccessStyle, checkCount } from "../../../utils/navigator";
import { ChatOption, CommentOptionProp, MakeToButtom, ThemeContextType } from "../../../types/posts";
import { useLikeAndUnlikeSharedStoryMutation, useShareStoryMutation } from "../../../app/api/sharedStorySlice";

type PostButtomProps = {
  story: MakeToButtom,
  viewUsers: ChatOption,
  averageReadingTime: string,
  setViewUsers: React.Dispatch<React.SetStateAction<ChatOption>>
}

export default function PostBase({ viewUsers, setViewUsers, story, averageReadingTime }: PostButtomProps) {
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const { theme, setLoginPrompt } = useThemeContext() as ThemeContextType
  const [openComment, setOpenComment] = useState<CommentOptionProp>({ option: 'Hide', storyId: '' })
  const [likeAndUnlikeStory, { isLoading: isLikeLoading, isError: isLikeError }] = useLikeAndUnlikeStoryMutation()
  const [shareStory, { isLoading: isSharedLoading, error: sharedError, isError: isSharedError }] = useShareStoryMutation();
  const [likeAndUnlikeSharedStory, { isLoading: isSharedLikeLoading, isError: isSharedLikeError }] = useLikeAndUnlikeSharedStoryMutation()

  const likeUnlikeStory = async() => {
    try{
      const { _id, sharedId } = story
      sharedId 
          ? await likeAndUnlikeSharedStory({userId: currentUserId, sharedId}).unwrap() 
              : await likeAndUnlikeStory({userId: currentUserId, storyId: _id}).unwrap()
    }
    catch(err: unknown){
      const errors = err as ErrorResponse
      (!currentUserId || !errors || errors?.originalStatus == 401) ? setLoginPrompt({opened: 'Open'}) : null;
      (isLikeError || isSharedLikeError) && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`,ErrorStyle)
    }
  }

  const shareNewStory = async() => {
    try{
      const { _id } = story
      await shareStory({userId: currentUserId, storyId: _id}).unwrap()
      toast.success('Story shared successfully', SuccessStyle)
    }
    catch(err: unknown){
      const errors = sharedError as Partial<ErrorResponse>
      (!currentUserId || !errors || errors?.originalStatus == 401) && setLoginPrompt({opened: 'Open'})
      isSharedError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
    }
  }

  return (
    <div className='relative mt-2 flex flex-col gap-1 text-sm font-sans'>
      
     {
      story?.likes?.length ?
        <p 
          onClick={() => setViewUsers('Open')}
          className='underline underline-offset-2 cursor-pointer hover:opacity-90 active:opacity-100 transition-all'>view likes</p>
      : null
     }

     { viewUsers === 'Open' ? <PostLikes storyId={story?._id} setViewUsers={setViewUsers} /> : null }
      
      <div className='relative flex items-center gap-5'>
        <p className="text-green-600">{story?.body ? averageReadingTime + ' read' : ''}</p>
        <p 
          onClick={likeUnlikeStory}
          className={`flex items-center gap-1 ${(isLikeLoading || isSharedLikeLoading) && 'animate-bounce'}`}>
          {
            (story?.sharedLikes ? story?.sharedLikes?.includes(currentUserId) : story?.likes?.includes(currentUserId)) 
              ?
              <BsFillHandThumbsUpFill 
              title='like'
              className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${theme == 'light' ? 'text-green-800' : ''}`} />
              :
              <BsHandThumbsUp 
                title='like' 
                className={`text-lg hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${theme == 'light' ? 'text-black' : 'text-white'}`} />
          }
            <span className={`font-mono text-base ${theme == 'dark' ? 'text-white' : 'text-black'}`}>
              {story?.sharedId ? checkCount(story?.sharedLikes) : checkCount(story?.likes)} 
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
              onClick={shareNewStory}
              className={`font-sans text-lg cursor-pointer ${isSharedLoading && 'animate-pulse'} ${theme == 'light' ? 'text-black' : 'text-gray-300'} hover:text-blue-800`}
            />
            <span role='count' title='share count' className={`${theme == 'light' ? 'text-black' : 'text-white'}`}>
              {story?.isShared?.length}
            </span>
          </p>
          
          <Comments openComment={openComment} setOpenComment={setOpenComment} />
      </div>
    </div>
  )
}