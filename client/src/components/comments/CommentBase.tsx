import { BsFillHandThumbsUpFill, BsHandThumbsUp } from 'react-icons/bs'
import { MdOutlineInsertComment } from 'react-icons/md';
import { Theme, ThemeContextType } from '../../posts';
import { CommentProps } from '../../data';
import { useThemeContext } from '../../hooks/useThemeContext';

type BaseProps = {
  userId: string,
  theme: Theme,
  comment: Pick<CommentProps, '_id' | 'likes' | 'comment'>
}

export default function CommentBase({userId, theme, comment}: BaseProps) {
  const {setParseId, setEnlarge} = useThemeContext() as ThemeContextType

  const openUpComment = (commentId: string) => {
    setEnlarge(true)
    setParseId(commentId)
  }
  return (
    <>
      <p className="flex items-center gap-1.5">
          {/* {auth?._id && (     */}

            <MdOutlineInsertComment 
              title='comments' 
              className={`font-sans cursor-pointer ${theme == 'light' ? 'text-black' : 'text-gray-300'} hover:text-blue-800`}
            />
            <span className={`font-mono text-xs ${theme == 'dark' && 'text-white'}`}>
              {comment?.likes?.length}
            </span>
            {/* )
          } */}
        </p>
        <p className="flex items-center gap-1">
          {userId && comment?.likes?.includes(userId)
            ?
            <BsFillHandThumbsUpFill title='like' className={`hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer ${theme == 'light' ? 'text-green-800' : ''}`} />
            :
            <BsHandThumbsUp title='like' className={`hover:scale-[1.1] active:scale-[1] transition-all cursor-pointer`} />
          }
          <span className={`font-mono text-xs ${theme == 'dark' && 'text-white'}`}>
            {comment?.likes?.length}
          </span>
        </p>
        {comment?.comment && (
            comment?.comment.split(' ').length >= 60 &&
              <small 
                onClick={() => openUpComment(comment?._id)}
                className={`font-sans cursor-grab ${theme == 'light' ? 'text-gray-900' : 'text-gray-300'} hover:text-gray-200`}>Read more</small>
          )
        }
        <span 
          className="cursor-pointer hover:opacity-70">reply</span>
    </>
  )
}