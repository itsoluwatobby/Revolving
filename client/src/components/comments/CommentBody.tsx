import { BsSend } from 'react-icons/bs'
import { MdCancel } from 'react-icons/md'
import { comments } from '../../commentData'
import CommentCompo from './CommentCompo'
import { useThemeContext } from '../../hooks/useThemeContext'
import { ThemeContextType } from '../../posts'
import { useState } from 'react'
import { SkeletonComment } from '../skeletons/SkeletonComment'
import { CommentProps } from '../../data'

export default function CommentBody() {
  const { theme, setOpenComment } = useThemeContext() as ThemeContextType
  const [isLoading, setIsloading] = useState<boolean>(true)

  let commentContent;

  !isLoading ? commentContent = (
    [...Array(5).keys()].map(i => (
      <SkeletonComment key={i} />
    ))
  )
  : commentContent = (
    <>
      {
        comments.map(comment => (
          <CommentCompo 
            key={comment?._id}
            comment={comment as CommentProps} 
            theme={theme} 
          />
        ))
      }
    </>
  )

  return (
    <>
       <MdCancel
        onClick={() => setOpenComment(false)}
        className={`fixed text-gray-800 text-2xl cursor-pointer hover:opacity-70 right-3 top-3`}/>
      <div className={`w-full flex mt-1 items-center rounded-md shadow-lg ${theme == 'light' ? 'bg-slate-500' : 'bg-slate-600'}`}>
        <input 
          type="text"
          name="comment"
          autoFocus={true}
          autoComplete="off"
          placeholder="share your thought"
          className={`flex-auto font-serif p-2 h-full w-10/12 focus:outline-none rounded-md ${theme == 'light' ? 'text-black' : 'text-white'} bg-inherit`}
        />
        <button className="flex-none w-12 hover:bg-opacity-50 hover:opacity-50 h-10 grid place-content-center transition-all rounded-tr-md rounded-br-md">
          <BsSend
            className={`text-lg text-center hover:scale-[1.08] active:scale-[1]`}
          />
        </button>
      </div>
      <div className="hidebars w-full overflow-y-scroll mt-2 flex flex-col">
        {commentContent}
      </div>
    </>
  )
}