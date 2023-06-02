import { useEffect, useState } from 'react'
import { useThemeContext } from '../../hooks/useThemeContext'
import { ThemeContextType } from '../../posts'
import { comments } from '../../commentData'
import { CommentProps } from '../../data'
import { reduceLength } from '../../assets/navigator'
import CommentBase from './CommentBase'
import { format } from 'timeago.js'
import { RiArrowGoBackLine } from 'react-icons/ri'


export default function EnlargeComment() {
  const { theme, parseId, setEnlarge } = useThemeContext() as ThemeContextType
  const [targetComment, setTargetComment] = useState<CommentProps | null>(null);
  const userId = localStorage.getItem('revolving_userId') as string

  useEffect(() => {
    const comment = comments.find(comm => comm?._id === parseId)
    setTargetComment(comment as CommentProps)
  }, [parseId])

  const content = (
    <article className="text-sm flex flex-col gap-1">
      <RiArrowGoBackLine
        onClick={() => setEnlarge(false)}
        className={`mb-3 text-xl text-white fixed cursor-pointer hover:text-gray-400`}
      />
      <div className={`sticky top-0 flex items-center ml-16 gap-4 ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-400'} w-fit p-0.5 rounded-full pl-2 pr-2`}>
        <p className={`cursor-pointer hover:opacity-70 transition-all text-sm ${theme == 'light' ? '' : 'text-black'}`}> 
          {reduceLength(targetComment?.author as string, 15)}
        </p>
        <span className="font-bold text-black">.</span>
        <p className="text-xs text-gray-700">{format(targetComment?.commentDate as string)}</p>
      </div>
      <p className="cursor-grab text-justify tracking-wide first-letter:ml-3 first-letter:text-lg first-letter:font-medium">
        {targetComment?.comment}
      </p>
      <div className="flex items-center gap-4">
        <CommentBase userId={userId} theme={theme} comment={targetComment as CommentProps} />
      </div>
    </article>
  )

  return (
    <section className='hidebars overflow-y-scroll p-2'>
      {targetComment && content}
    </section>
  )
}